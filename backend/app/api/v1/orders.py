import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.api.deps import get_current_user, get_current_user_optional, get_current_active_admin

router = APIRouter(prefix="/orders", tags=["Orders"])

FREE_SHIPPING_THRESHOLD = 60.0
STANDARD_SHIPPING_FEE = 6.0


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
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

    # 4. Create Order record (link user_id if authenticated)
    order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
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


@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve personal order history for the currently authenticated customer."""
    query = db.query(Order).filter(Order.user_id == current_user.id)
    if current_user.phone:
        query = db.query(Order).filter(
            (Order.user_id == current_user.id) | (Order.customer_phone == current_user.phone)
        )
    orders = query.order_by(Order.created_at.desc()).all()
    return [OrderResponse.model_validate(o) for o in orders]


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


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Administrator endpoint to update order progression across its lifecycle."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found.",
        )
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order)
