from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ImageQualityResult(BaseModel):
    is_adequate_resolution: bool
    is_sufficient_lighting: bool
    is_face_centered: bool
    is_acceptable: bool
    lighting_score: float = Field(..., ge=0.0, le=100.0)
    sharpness_score: float = Field(..., ge=0.0, le=100.0)
    feedback_message: Optional[str] = None
    uncertainty_reasons: List[str] = []


class RegionMetric(BaseModel):
    region_name: str
    relative_redness: float = Field(..., ge=0.0, le=100.0)
    specular_shine: float = Field(..., ge=0.0, le=100.0)
    texture_roughness: float = Field(..., ge=0.0, le=100.0)
    observation_summary: str


class ObservableMetrics(BaseModel):
    redness_index: float = Field(..., ge=0.0, le=100.0, description="Observable chromatic redness estimate")
    shine_index: float = Field(..., ge=0.0, le=100.0, description="Surface specular reflectance estimate")
    texture_roughness_index: float = Field(..., ge=0.0, le=100.0, description="Surface micro-texture roughness estimate")
    pore_prominence_index: float = Field(..., ge=0.0, le=100.0, description="Localized micro-relief pore density estimate")
    overall_confidence: float = Field(..., ge=0.0, le=100.0, description="Diagnostic reliability confidence based on capture quality")
    estimated_skin_tendency: str = Field(..., description="Estimated observable tendency: Balanced, Dehydrated/Dry appearance, Reactive/Redness-prone, or Shine/Congestion-prone")
    is_reliable: bool


class CalibratedRecommendation(BaseModel):
    product_id: str
    product_name: str
    category: str
    price: float
    image_url: str
    match_score: int
    why_it_matches: str
    target_trait: str
    key_active_ingredients: List[str]
    allergen_safety_status: str
    skin_type_alignment: str


class SkinAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    manual_optical_measurements: Optional[Dict[str, float]] = None
    user_skin_type: Optional[str] = "All"
    user_concerns: List[str] = []
    known_allergens: List[str] = []
    sensitivity_level: Optional[str] = "Moderate"


class SkinAnalysisResponse(BaseModel):
    quality: ImageQualityResult
    observable_metrics: Optional[ObservableMetrics] = None
    regions: List[RegionMetric] = []
    recommendations: List[CalibratedRecommendation] = []
    disclaimer: str
    processed_at: str
