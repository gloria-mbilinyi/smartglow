from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.product import Product
from app.schemas.skin_analysis import (
    SkinAnalysisRequest,
    SkinAnalysisResponse,
    ImageQualityResult,
    ObservableMetrics,
    RegionMetric,
    CalibratedRecommendation,
)
from app.api.deps import get_current_user_optional
from app.services.skin_analysis import (
    decode_image_base64,
    evaluate_image_quality,
    extract_facial_regions_and_metrics,
    calibrate_product_recommendations,
    NON_CLINICAL_DISCLAIMER,
)

router = APIRouter(prefix="/skin-analysis", tags=["AI Skin Analysis & Calibration"])


@router.post("/analyze", response_model=SkinAnalysisResponse)
def analyze_facial_skin(
    payload: SkinAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Perform non-clinical observable facial skin analysis and calibrate explainable formulation matches.
    Photos are processed in-memory and discarded immediately; biometric images are never stored.
    """
    # 1. Merge preferences from authenticated user profile if not explicitly specified in payload
    user_skin_type = payload.user_skin_type
    user_concerns = payload.user_concerns
    known_allergens = payload.known_allergens
    sensitivity_level = payload.sensitivity_level

    if current_user:
        if not user_skin_type or user_skin_type == "All":
            user_skin_type = current_user.skin_type or "All"
        if not user_concerns and current_user.skin_concerns:
            user_concerns = current_user.skin_concerns
        if not known_allergens and current_user.known_allergens:
            known_allergens = current_user.known_allergens
        if not sensitivity_level and current_user.sensitivity_level:
            sensitivity_level = current_user.sensitivity_level

    # 2. Evaluate Image Quality
    img = None
    if payload.image_base64:
        img = decode_image_base64(payload.image_base64)
        quality = evaluate_image_quality(img)
    elif payload.manual_optical_measurements:
        # Manual/Preset measurement mode
        quality = ImageQualityResult(
            is_adequate_resolution=True,
            is_sufficient_lighting=True,
            is_face_centered=True,
            is_acceptable=True,
            lighting_score=85.0,
            sharpness_score=90.0,
            feedback_message="Calibrated preset inputs accepted for optical simulation.",
            uncertainty_reasons=[],
        )
    else:
        quality = ImageQualityResult(
            is_adequate_resolution=False,
            is_sufficient_lighting=False,
            is_face_centered=False,
            is_acceptable=False,
            lighting_score=0.0,
            sharpness_score=0.0,
            feedback_message="No image or optical measurements provided. Please capture a clear photograph.",
            uncertainty_reasons=["Missing photographic input"],
        )

    # 3. Extract Observable Regional Metrics
    metrics, regions = extract_facial_regions_and_metrics(
        img=img,
        quality=quality,
        manual_measurements=payload.manual_optical_measurements,
    )

    # 4. Calibrate Recommendations against Active Database Products
    all_products = db.query(Product).filter(Product.is_active == True).all()
    recommendations: List[CalibratedRecommendation] = []
    if quality.is_acceptable and metrics.is_reliable:
        recommendations = calibrate_product_recommendations(
            all_products=all_products,
            metrics=metrics,
            user_skin_type=user_skin_type,
            user_concerns=user_concerns,
            known_allergens=known_allergens,
            sensitivity_level=sensitivity_level,
        )

    return SkinAnalysisResponse(
        quality=quality,
        observable_metrics=metrics,
        regions=regions,
        recommendations=recommendations,
        disclaimer=NON_CLINICAL_DISCLAIMER,
        processed_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/presets")
def get_diagnostic_presets():
    """Return synthetic diagnostic test presets across various observable conditions and skin tones."""
    return [
        {
            "id": "preset_balanced",
            "title": "Balanced & Radiant Surface",
            "description": "Uniform diffuse lighting, balanced micro-erythema and low surface shine.",
            "skin_type": "Normal",
            "skin_tone": "Medium Warm",
            "measurements": {"redness": 28.0, "shine": 32.0, "texture": 24.0, "pores": 26.0},
        },
        {
            "id": "preset_reactive_redness",
            "title": "Reactive Redness & Sensitive Barrier",
            "description": "Elevated cheek chromatic redness, sensitive vascular reactivity, moderate dryness.",
            "skin_type": "Sensitive",
            "skin_tone": "Fair Neutral",
            "measurements": {"redness": 68.0, "shine": 22.0, "texture": 42.0, "pores": 30.0},
        },
        {
            "id": "preset_tzone_shine",
            "title": "T-Zone Shine & Pore Prominence",
            "description": "Prominent nasal specular shine, enlarged pore density, and combination cheeks.",
            "skin_type": "Combination",
            "skin_tone": "Deep Cool",
            "measurements": {"redness": 34.0, "shine": 72.0, "texture": 38.0, "pores": 65.0},
        },
        {
            "id": "preset_dehydrated_texture",
            "title": "Micro-Texture Unevenness & Dehydration",
            "description": "Low surface specular shine, visible high-frequency micro-roughness on cheeks and forehead.",
            "skin_type": "Dry",
            "skin_tone": "Rich Deep",
            "measurements": {"redness": 38.0, "shine": 18.0, "texture": 66.0, "pores": 34.0},
        },
    ]
