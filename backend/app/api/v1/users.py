from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.product import Product
from app.schemas.user import UserProfileUpdate, SkinPreferencesUpdate, UserResponse
from app.schemas.product import ProductResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.put("/me/profile", response_model=UserResponse)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user personal contact details."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.put("/me/skin-preferences", response_model=UserResponse)
def update_skin_preferences(
    payload: SkinPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save customer skin profile, target concerns, sensitivity level, and known allergens."""
    if payload.skin_type is not None:
        current_user.skin_type = payload.skin_type.strip()
    if payload.skin_concerns is not None:
        current_user.skin_concerns = payload.skin_concerns
    if payload.sensitivity_level is not None:
        current_user.sensitivity_level = payload.sensitivity_level.strip()
    if payload.known_allergens is not None:
        current_user.known_allergens = payload.known_allergens
    if payload.preferred_routine is not None:
        current_user.preferred_routine = payload.preferred_routine.strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/me/recommendations", response_model=List[ProductResponse])
def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate personalized formulation recommendations tailored to customer saved skin preferences."""
    all_products = db.query(Product).filter(Product.is_active == True).all()

    user_type = (current_user.skin_type or "All").lower()
    user_concerns = [c.lower() for c in (current_user.skin_concerns or [])]
    allergens = [a.lower() for a in (current_user.known_allergens or [])]

    recommended = []
    for p in all_products:
        # Check allergen exclusion
        all_ing_lower = (p.all_ingredients or "").lower()
        if any(allergen in all_ing_lower for allergen in allergens if allergen):
            continue

        # Compatibility score
        score = 0
        p_types = [t.lower() for t in (p.skin_types or [])]
        if "all" in p_types or user_type == "all" or user_type in p_types:
            score += 2

        p_concerns = [c.lower() for c in (p.skin_concerns or [])]
        for c in user_concerns:
            if c in p_concerns or "all" in p_concerns:
                score += 1

        if score > 0:
            recommended.append((score, p))

    # Sort by compatibility score descending, then rating
    recommended.sort(key=lambda x: (x[0], x[1].rating), reverse=True)
    return [ProductResponse.model_validate(p) for _, p in recommended]
