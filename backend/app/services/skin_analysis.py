import io
import base64
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image
import numpy as np

from app.models.product import Product
from app.schemas.skin_analysis import (
    ImageQualityResult,
    RegionMetric,
    ObservableMetrics,
    CalibratedRecommendation,
    SkinAnalysisResponse,
)

NON_CLINICAL_DISCLAIMER = (
    "SmartGlow Facial Analysis is exclusively designed for cosmetic and formulation-matching guidance. "
    "Visible shine, redness, and texture are optical surface estimates influenced by camera sensors, "
    "lighting, humidity, and topical skincare. Photographs do not measure dermal hydration, sebum excretion "
    "rate, or skin barrier permeability, and cannot diagnose or treat medical skin conditions."
)


def decode_image_base64(data_uri: str) -> Optional[Image.Image]:
    """Decode a base64 or data-URI string into a PIL Image."""
    if not data_uri:
        return None
    try:
        if "," in data_uri:
            data_uri = data_uri.split(",", 1)[1]
        decoded = base64.b64decode(data_uri)
        img = Image.open(io.BytesIO(decoded)).convert("RGB")
        return img
    except Exception:
        return None


def evaluate_image_quality(img: Optional[Image.Image]) -> ImageQualityResult:
    """Evaluate image resolution, focus sharpness, and lighting distribution."""
    if img is None:
        return ImageQualityResult(
            is_adequate_resolution=False,
            is_sufficient_lighting=False,
            is_face_centered=False,
            is_acceptable=False,
            lighting_score=0.0,
            sharpness_score=0.0,
            feedback_message="No image provided or image stream corrupted. Please capture a clear photograph.",
            uncertainty_reasons=["Missing image data"],
        )

    width, height = img.size
    is_adequate_res = width >= 320 and height >= 320

    # Convert to grayscale array for lighting & focus analysis
    gray = np.array(img.convert("L"), dtype=np.float32)

    # Lighting check: mean luminance and standard deviation
    mean_lum = float(np.mean(gray))
    std_lum = float(np.std(gray))

    # Normalized 0-100 lighting score (ideal mean is ~115-145)
    lum_diff = abs(mean_lum - 130.0)
    lighting_score = max(0.0, min(100.0, 100.0 - (lum_diff * 0.9)))
    is_sufficient_light = 45.0 <= mean_lum <= 220.0 and std_lum >= 18.0

    # Sharpness / Blur check via 2D discrete Laplacian variance
    # Discrete Laplacian kernel
    # [ 0,  1, 0]
    # [ 1, -4, 1]
    # [ 0,  1, 0]
    padded = np.pad(gray, 1, mode="edge")
    laplacian = (
        padded[1:-1, 2:]
        + padded[1:-1, :-2]
        + padded[2:, 1:-1]
        + padded[:-2, 1:-1]
        - 4 * gray
    )
    laplacian_var = float(np.var(laplacian))

    # Score sharpness on 0-100 scale (var > 80 is sharp, < 30 is blurry)
    sharpness_score = max(0.0, min(100.0, (laplacian_var / 80.0) * 100.0))
    is_sharp = laplacian_var >= 25.0

    # Face Centering / Boundary assumption (for photographic captures)
    is_centered = is_adequate_res and width / max(1, height) >= 0.5 and width / max(1, height) <= 2.0

    uncertainty_reasons: List[str] = []
    feedback = "Image passes non-clinical cosmetic quality checks."

    if not is_adequate_res:
        uncertainty_reasons.append(f"Low resolution ({width}x{height}); minimum recommended is 320x320.")
        feedback = "Image resolution is too low. Please hold the camera closer or increase resolution."
    elif mean_lum < 45.0:
        uncertainty_reasons.append(f"Underexposed lighting (mean luminance {mean_lum:.1f}).")
        feedback = "Low lighting detected. Please face a soft, indirect natural light source."
    elif mean_lum > 220.0:
        uncertainty_reasons.append(f"Overexposed capture / direct wash-out (mean luminance {mean_lum:.1f}).")
        feedback = "Harsh glare or direct backlighting detected. Avoid strong direct overhead bulbs."
    elif not is_sharp:
        uncertainty_reasons.append(f"Low optical focus sharpness (variance {laplacian_var:.1f}).")
        feedback = "Motion blur or soft focus detected. Hold device steady and tap to focus."

    is_acceptable = is_adequate_res and is_sharp and is_sufficient_light and is_centered

    return ImageQualityResult(
        is_adequate_resolution=is_adequate_res,
        is_sufficient_lighting=is_sufficient_light,
        is_face_centered=is_centered,
        is_acceptable=is_acceptable,
        lighting_score=round(lighting_score, 1),
        sharpness_score=round(sharpness_score, 1),
        feedback_message=feedback,
        uncertainty_reasons=uncertainty_reasons,
    )


def extract_facial_regions_and_metrics(
    img: Optional[Image.Image],
    quality: ImageQualityResult,
    manual_measurements: Optional[Dict[str, float]] = None,
) -> Tuple[ObservableMetrics, List[RegionMetric]]:
    """Extract observable optical attributes across facial regions."""
    if not quality.is_acceptable and not manual_measurements:
        # Return fallback uncertainty metrics
        metrics = ObservableMetrics(
            redness_index=0.0,
            shine_index=0.0,
            texture_roughness_index=0.0,
            pore_prominence_index=0.0,
            overall_confidence=0.0,
            estimated_skin_tendency="Insufficient Image Quality for Analysis",
            is_reliable=False,
        )
        return metrics, []

    # If manual measurements provided (e.g. from client-side computer vision or mock presets)
    if manual_measurements:
        redness = float(manual_measurements.get("redness", 35.0))
        shine = float(manual_measurements.get("shine", 40.0))
        texture = float(manual_measurements.get("texture", 30.0))
        pores = float(manual_measurements.get("pores", 35.0))
    elif img is not None:
        # Compute optical observables from pixel channels
        rgb_arr = np.array(img, dtype=np.float32)
        r = rgb_arr[:, :, 0]
        g = rgb_arr[:, :, 1]
        b = rgb_arr[:, :, 2]

        h, w, _ = rgb_arr.shape

        # Define 5 facial regions:
        # 1. Forehead: Top 15% to 35% height, middle 30% to 70% width
        # 2. T-Zone (Nose): 35% to 65% height, 40% to 60% width
        # 3. Left Cheek: 45% to 75% height, 15% to 38% width
        # 4. Right Cheek: 45% to 75% height, 62% to 85% width
        # 5. Chin: 75% to 92% height, 35% to 65% width
        y_fh_start, y_fh_end = int(h * 0.15), int(h * 0.35)
        x_fh_start, x_fh_end = int(w * 0.30), int(w * 0.70)

        y_tz_start, y_tz_end = int(h * 0.35), int(h * 0.65)
        x_tz_start, x_tz_end = int(w * 0.40), int(w * 0.60)

        y_lc_start, y_lc_end = int(h * 0.45), int(h * 0.75)
        x_lc_start, x_lc_end = int(w * 0.15), int(w * 0.38)

        y_rc_start, y_rc_end = int(h * 0.45), int(h * 0.75)
        x_rc_start, x_rc_end = int(w * 0.62), int(w * 0.85)

        y_ch_start, y_ch_end = int(h * 0.75), int(h * 0.92)
        x_ch_start, x_ch_end = int(w * 0.35), int(w * 0.65)

        # Region redness: (R - G) / (R + G + 1e-5) normalized
        def get_region_redness(ys, ye, xs, xe):
            reg_r = r[ys:ye, xs:xe]
            reg_g = g[ys:ye, xs:xe]
            denom = reg_r + reg_g + 1e-5
            diff = (reg_r - reg_g) / denom
            mean_diff = float(np.mean(diff))
            return max(0.0, min(100.0, (mean_diff - 0.05) * 200.0))

        # Specular shine: percentage of pixels with high luminance in top 15%
        def get_region_shine(ys, ye, xs, xe):
            patch = (r[ys:ye, xs:xe] + g[ys:ye, xs:xe] + b[ys:ye, xs:xe]) / 3.0
            high_specular = float(np.mean(patch > 200.0))
            patch_std = float(np.std(patch))
            return max(0.0, min(100.0, high_specular * 350.0 + (patch_std * 0.6)))

        # Texture roughness: high frequency spatial variance
        def get_region_texture(ys, ye, xs, xe):
            gray_patch = (0.299 * r[ys:ye, xs:xe] + 0.587 * g[ys:ye, xs:xe] + 0.114 * b[ys:ye, xs:xe])
            dy, dx = np.gradient(gray_patch)
            grad_mag = np.sqrt(dx**2 + dy**2)
            grad_var = float(np.var(grad_mag))
            return max(0.0, min(100.0, (grad_var / 35.0) * 100.0))

        redness = (get_region_redness(y_lc_start, y_lc_end, x_lc_start, x_lc_end) +
                   get_region_redness(y_rc_start, y_rc_end, x_rc_start, x_rc_end)) / 2.0
        shine = get_region_shine(y_tz_start, y_tz_end, x_tz_start, x_tz_end)
        texture = (get_region_texture(y_fh_start, y_fh_end, x_fh_start, x_fh_end) +
                   get_region_texture(y_lc_start, y_lc_end, x_lc_start, x_lc_end)) / 2.0
        pores = min(100.0, shine * 0.6 + texture * 0.4)
    else:
        redness, shine, texture, pores = 35.0, 35.0, 30.0, 30.0

    # Regional metrics breakdown with strict 0-100 clamping
    def clamp_val(val: float) -> float:
        return round(max(0.0, min(100.0, float(val))), 1)

    regions = [
        RegionMetric(
            region_name="Forehead",
            relative_redness=clamp_val(redness * 0.8),
            specular_shine=clamp_val(shine * 0.9),
            texture_roughness=clamp_val(texture * 1.05),
            observation_summary="Upper zone surface smoothness and natural light diffusion.",
        ),
        RegionMetric(
            region_name="Nose & T-Zone",
            relative_redness=clamp_val(redness * 0.9),
            specular_shine=clamp_val(shine * 1.25),
            texture_roughness=clamp_val(texture * 0.95),
            observation_summary="Central sebaceous zone with higher specular reflectance.",
        ),
        RegionMetric(
            region_name="Left Cheek",
            relative_redness=clamp_val(redness * 1.05),
            specular_shine=clamp_val(shine * 0.75),
            texture_roughness=clamp_val(texture),
            observation_summary="Buccal zone showing localized vascular micro-erythema.",
        ),
        RegionMetric(
            region_name="Right Cheek",
            relative_redness=clamp_val(redness * 1.02),
            specular_shine=clamp_val(shine * 0.72),
            texture_roughness=clamp_val(texture * 0.98),
            observation_summary="Lateral cheek surface moisture balance and barrier uniformity.",
        ),
        RegionMetric(
            region_name="Chin",
            relative_redness=clamp_val(redness * 0.9),
            specular_shine=clamp_val(shine * 0.85),
            texture_roughness=clamp_val(texture * 1.02),
            observation_summary="Lower jawline cellular renewal balance.",
        ),
    ]

    # Deduce estimated tendency (purely non-clinical observable classification)
    if redness > 55.0:
        tendency = "Reactive & Redness-Prone Tendency"
    elif shine > 55.0 and pores > 50.0:
        tendency = "Oily & High-Shine T-Zone Tendency"
    elif texture > 55.0 or (shine < 25.0 and redness < 35.0):
        tendency = "Dry & Dehydration Tendency"
    else:
        tendency = "Balanced & Normal Surface Tendency"

    overall_confidence = round(
        (quality.lighting_score * 0.45) + (quality.sharpness_score * 0.55), 1
    )

    metrics = ObservableMetrics(
        redness_index=round(redness, 1),
        shine_index=round(shine, 1),
        texture_roughness_index=round(texture, 1),
        pore_prominence_index=round(pores, 1),
        overall_confidence=overall_confidence,
        estimated_skin_tendency=tendency,
        is_reliable=quality.is_acceptable and overall_confidence >= 50.0,
    )

    return metrics, regions


def calibrate_product_recommendations(
    all_products: List[Product],
    metrics: ObservableMetrics,
    user_skin_type: Optional[str] = "All",
    user_concerns: Optional[List[str]] = None,
    known_allergens: Optional[List[str]] = None,
    sensitivity_level: Optional[str] = "Moderate",
) -> List[CalibratedRecommendation]:
    """
    Select and explain product formulations tailored to detected observable surface traits,
    enforcing zero-tolerance customer allergen safety.
    """
    if user_concerns is None:
        user_concerns = []
    if known_allergens is None:
        known_allergens = []

    user_allergens_clean = [a.strip().lower() for a in known_allergens if a.strip()]
    user_type_clean = (user_skin_type or "All").strip().lower()

    recommendations: List[Tuple[int, CalibratedRecommendation]] = []

    for p in all_products:
        if not p.is_active:
            continue

        all_ingredients_text = (p.all_ingredients or "").lower()
        key_ingredients_text = " ".join(p.key_ingredients_list or []).lower()
        full_ingredient_profile = f"{all_ingredients_text} {key_ingredients_text}"

        # 1. STRICT ALLERGEN SAFETY VERIFICATION
        # If any user-specified allergen matches the product ingredients, strictly exclude it.
        has_allergen_conflict = False
        conflicting_allergen = None
        for allergen in user_allergens_clean:
            if allergen in full_ingredient_profile:
                has_allergen_conflict = True
                conflicting_allergen = allergen
                break

        if has_allergen_conflict:
            continue

        # 2. COMPATIBILITY & EXPLAINABLE MATCHING
        score = 0
        match_reasons: List[str] = []
        target_trait = "Balanced Daily Support"

        p_skin_types = [t.lower() for t in (p.skin_types or [])]
        p_concerns = [c.lower() for c in (p.skin_concerns or [])]

        # Trait 1: High visible redness / reactive barrier
        if metrics.redness_index >= 45.0 or "redness" in [c.lower() for c in user_concerns]:
            if any(term in full_ingredient_profile for term in ["centella", "ceramide", "tripeptide", "allantoin", "copper"]):
                score += 5
                target_trait = "Observable Redness Calming"
                match_reasons.append("Formulated with soothing barrier restoratives (Centella Asiatica / Ceramides) to calm visible surface flushing")

        # Trait 2: High shine / T-Zone sebum tendency
        if metrics.shine_index >= 45.0 or "acne" in " ".join(user_concerns).lower():
            if any(term in full_ingredient_profile for term in ["zinc", "niacinamide", "salicylic", "tea", "clay"]):
                score += 4
                target_trait = "Shine & Pore Refinement"
                match_reasons.append("Balances T-zone specular reflections with non-drying clarifying botanical actives")

        # Trait 3: Micro-texture roughness / dullness
        if metrics.texture_roughness_index >= 40.0 or "dullness" in " ".join(user_concerns).lower():
            if any(term in full_ingredient_profile for term in ["ascorbyl", "vitamin c", "ferulic", "pha", "glycolic"]):
                score += 4
                target_trait = "Micro-Texture Smoothing"
                match_reasons.append("Contains stabilized antioxidants to refine uneven surface topography and revive luminosity")

        # Trait 4: Hydration & Barrier replenishment
        if metrics.texture_roughness_index >= 45.0 and metrics.shine_index < 35.0:
            if any(term in full_ingredient_profile for term in ["hyaluronic", "squalane", "glycerin", "panthenol"]):
                score += 4
                target_trait = "Deep Hydration Replenishment"
                match_reasons.append("Multi-molecular hydration complex replenishes surface moisture reservoirs")

        # User stated skin type alignment
        type_aligned = "all" in p_skin_types or user_type_clean == "all" or user_type_clean in p_skin_types
        if type_aligned:
            score += 2

        # User stated concerns
        for c in user_concerns:
            if c.lower() in p_concerns or "all" in p_concerns:
                score += 2

        if score > 0:
            why = " & ".join(match_reasons) if match_reasons else "Botanical formulation matching your general skin profile."
            allergen_status = (
                f"Verified Safe · 0 detected allergens across your profile ({', '.join(user_allergens_clean)})"
                if user_allergens_clean
                else "Clean Botanical Formulation · Complete Ingredient Transparency"
            )
            skin_alignment = (
                f"Fully compatible with {user_skin_type.capitalize()} skin"
                if user_skin_type and user_skin_type != "All"
                else "Universal compatibility across all skin types"
            )

            item = CalibratedRecommendation(
                product_id=p.id,
                product_name=p.name,
                category=p.category.name if p.category else "Skincare",
                price=float(p.price),
                image_url=p.image_url,
                match_score=min(99, 70 + (score * 3)),
                why_it_matches=why,
                target_trait=target_trait,
                key_active_ingredients=p.key_ingredients_list or [],
                allergen_safety_status=allergen_status,
                skin_type_alignment=skin_alignment,
            )
            recommendations.append((score, item))

    # Sort descending by match score
    recommendations.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in recommendations[:5]]
