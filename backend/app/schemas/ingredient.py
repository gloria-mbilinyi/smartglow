from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class IngredientBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    safety_rating: Optional[str] = "Clean / Skin-Safe"
    is_active_ingredient: bool = True


class IngredientCreate(IngredientBase):
    pass


class IngredientResponse(IngredientBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
