from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[str]
    product_name: str
    unit_price: float
    quantity: int
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    customer_phone: str = Field(..., min_length=5, max_length=50)
    delivery_address: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=2, max_length=30)
    payment_method: str = Field(default="Cash on Delivery")
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    delivery_address: str
    city: str
    postal_code: str
    payment_method: str
    status: str
    subtotal: float
    shipping_cost: float
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
