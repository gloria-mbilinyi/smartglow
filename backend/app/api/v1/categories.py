from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryResponse, CategoryCreate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """Retrieve all product categories with their respective active product count."""
    categories = db.query(Category).all()
    results = []
    for cat in categories:
        count = db.query(func.count(Product.id)).filter(Product.category_id == cat.id, Product.is_active == True).scalar()
        cat_resp = CategoryResponse.model_validate(cat)
        cat_resp.products_count = count or 0
        results.append(cat_resp)
    return results


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Retrieve a single category by its integer ID."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found",
        )
    count = db.query(func.count(Product.id)).filter(Product.category_id == category.id, Product.is_active == True).scalar()
    cat_resp = CategoryResponse.model_validate(category)
    cat_resp.products_count = count or 0
    return cat_resp


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new product category."""
    existing = db.query(Category).filter(
        (Category.slug == payload.slug) | (Category.name == payload.name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{payload.name}' or slug '{payload.slug}' already exists",
        )
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    cat_resp = CategoryResponse.model_validate(category)
    cat_resp.products_count = 0
    return cat_resp
