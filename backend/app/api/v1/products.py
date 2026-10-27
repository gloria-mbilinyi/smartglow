from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.db.session import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductResponse, ProductListResponse, ProductCreate

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = Query(None, description="Category name or slug to filter by"),
    skin_type: Optional[str] = Query(None, description="Target skin type (e.g. Sensitive, Oily, Dry)"),
    skin_concern: Optional[str] = Query(None, description="Skin concern (e.g. Dullness, Acne & Pores)"),
    search: Optional[str] = Query(None, description="Keyword search in name, subtitle, or description"),
    sort_by: Optional[str] = Query("featured", description="Sort: featured, price-asc, price-desc, rating"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Retrieve catalog products with comprehensive filtering, sorting, and pagination."""
    query = db.query(Product).filter(Product.is_active == True)

    # Filter by category
    if category and category.lower() != "all":
        cat = db.query(Category).filter(
            or_(Category.slug == category.lower(), Category.name.ilike(category))
        ).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
        else:
            # Category requested doesn't exist
            return ProductListResponse(items=[], total=0, page=page, page_size=page_size)

    # Filter by search term
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.subtitle.ilike(term),
                Product.description.ilike(term),
                Product.all_ingredients.ilike(term),
            )
        )

    # Execute query to get intermediate items for JSON array matching
    all_matching = query.all()

    # Filter by skin_type in JSON array
    if skin_type and skin_type.lower() != "all":
        st_lower = skin_type.lower()
        all_matching = [
            p for p in all_matching
            if any(t.lower() == st_lower or t.lower() == "all" for t in (p.skin_types or []))
        ]

    # Filter by skin_concern in JSON array
    if skin_concern and skin_concern.lower() != "all":
        sc_lower = skin_concern.lower()
        all_matching = [
            p for p in all_matching
            if any(c.lower() == sc_lower or c.lower() == "all" for c in (p.skin_concerns or []))
        ]

    # Sorting
    if sort_by == "price-asc":
        all_matching.sort(key=lambda p: p.price)
    elif sort_by == "price-desc":
        all_matching.sort(key=lambda p: p.price, reverse=True)
    elif sort_by == "rating":
        all_matching.sort(key=lambda p: p.rating, reverse=True)

    total = len(all_matching)
    start = (page - 1) * page_size
    paged_items = all_matching[start : start + page_size]

    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in paged_items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Retrieve complete product details by product ID."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found",
        )
    return ProductResponse.model_validate(product)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product in the catalog."""
    existing = db.query(Product).filter(
        or_(Product.id == payload.id, Product.slug == payload.slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with ID '{payload.id}' or slug '{payload.slug}' already exists",
        )

    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with ID {payload.category_id} does not exist",
        )

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)
