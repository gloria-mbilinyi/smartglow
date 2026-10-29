from typing import List, Optional
from pydantic import BaseModel, Field


class StockUpdatePayload(BaseModel):
    stock_count: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None


class InventoryItemResponse(BaseModel):
    id: str
    name: str
    category_name: str
    price: float
    stock_count: int
    is_active: bool
    is_low_stock: bool


class InventoryOverviewResponse(BaseModel):
    total_products: int
    active_products: int
    low_stock_count: int
    items: List[InventoryItemResponse]
