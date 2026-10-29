from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.user import User
from app.schemas.inventory import StockUpdatePayload, InventoryItemResponse, InventoryOverviewResponse
from app.schemas.order import OrderResponse
from app.api.deps import get_current_active_admin
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Administrator & Inventory"])


@router.get("/inventory", response_model=InventoryOverviewResponse)
def get_inventory_overview(
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Retrieve full warehouse inventory status with real-time low-stock alerts."""
    products = db.query(Product).all()

    items = []
    low_stock_count = 0
    active_count = 0

    for p in products:
        if p.is_active:
            active_count += 1
        is_low = p.stock_count < settings.LOW_STOCK_THRESHOLD
        if is_low:
            low_stock_count += 1

        cat_name = p.category.name if p.category else "Unassigned"
        items.append(
            InventoryItemResponse(
                id=p.id,
                name=p.name,
                category_name=cat_name,
                price=p.price,
                stock_count=p.stock_count,
                is_active=p.is_active,
                is_low_stock=is_low,
            )
        )

    return InventoryOverviewResponse(
        total_products=len(products),
        active_products=active_count,
        low_stock_count=low_stock_count,
        items=items,
    )


@router.patch("/products/{product_id}/stock", response_model=InventoryItemResponse)
def update_product_inventory(
    product_id: str,
    payload: StockUpdatePayload,
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Update stock quantity, pricing, or catalog visibility for a formulation."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found.",
        )

    if payload.stock_count is not None:
        product.stock_count = payload.stock_count
    if payload.price is not None:
        product.price = payload.price
    if payload.is_active is not None:
        product.is_active = payload.is_active

    db.commit()
    db.refresh(product)

    cat_name = product.category.name if product.category else "Unassigned"
    return InventoryItemResponse(
        id=product.id,
        name=product.name,
        category_name=cat_name,
        price=product.price,
        stock_count=product.stock_count,
        is_active=product.is_active,
        is_low_stock=product.stock_count < settings.LOW_STOCK_THRESHOLD,
    )


@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, confirmed, processing, shipped, delivered, cancelled"),
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Administrator endpoint to view all system orders with optional lifecycle filter."""
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter.lower())
    orders = query.order_by(Order.created_at.desc()).all()
    return [OrderResponse.model_validate(o) for o in orders]
