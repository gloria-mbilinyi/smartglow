import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

FREE_SHIPPING_THRESHOLD = 60.0
STANDARD_SHIPPING_FEE = 6.0


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Place an order with real-time stock verification, automatic total calculations, and atomic inventory reduction."""
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item.",
        )

    # 1. Verify items and stock availability
    order_items_to_create = []
    subtotal = 0.0

    for item_in in payload.items:
        product = db.query(Product).filter(
            Product.id == item_in.product_id,
            Product.is_active == True,
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{item_in.product_id}' was not found in active catalog.",
            )

        if product.stock_count < item_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for '{product.name}'. Requested: {item_in.quantity}, Available: {product.stock_count}.",
            )

        item_total = round(product.price * item_in.quantity, 2)
        subtotal += item_total

        # Prepare OrderItem
        order_item = OrderItem(
            product_id=product.id,
            product_name=product.name,
            unit_price=product.price,
            quantity=item_in.quantity,
            total_price=item_total,
        )
        order_items_to_create.append((product, order_item))

    # 2. Shipping & Total Calculation
    subtotal = round(subtotal, 2)
    shipping_cost = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else STANDARD_SHIPPING_FEE
    total_amount = round(subtotal + shipping_cost, 2)

    # 3. Generate unique order number
    order_number = f"SG-{random.randint(100000, 999999)}"

    # 4. Create Order record
    order = Order(
        order_number=order_number,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        delivery_address=payload.delivery_address.strip(),
        city=payload.city.strip(),
        postal_code=payload.postal_code.strip(),
        payment_method=payload.payment_method,
        status="confirmed",
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total_amount=total_amount,
    )
    db.add(order)
    db.flush()

    # 5. Link items & atomically decrement inventory
    for product, order_item in order_items_to_create:
        order_item.order_id = order.id
        db.add(order_item)
        product.stock_count -= order_item.quantity

    db.commit()
    db.refresh(order)

    return OrderResponse.model_validate(order)


@router.get("/{order_number}", response_model=OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Retrieve complete order details and delivery status by order reference."""
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_number}' not found.",
        )
    return OrderResponse.model_validate(order)
