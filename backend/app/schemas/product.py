from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.category import CategoryResponse


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    subtitle: Optional[str] = None
    slug: str = Field(..., min_length=2, max_length=220)
    category_id: int
    price: float = Field(..., gt=0)
    rating: float = Field(default=5.0, ge=1.0, le=5.0)
    reviews_count: int = Field(default=0, ge=0)
    skin_types: List[str] = Field(default_factory=list)
    skin_concerns: List[str] = Field(default_factory=list)
    key_ingredients_list: List[str] = Field(default_factory=list)
    all_ingredients: Optional[str] = None
    description: str
    benefits: List[str] = Field(default_factory=list)
    usage: Optional[str] = None
    volume: Optional[str] = None
    stock_count: int = Field(default=0, ge=0)
    image_url: str
    tag: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    id: str = Field(..., min_length=3, max_length=64)


class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
