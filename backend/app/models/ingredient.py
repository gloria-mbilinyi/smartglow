from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

# Association table between Product and Ingredient
product_ingredients = Table(
    "product_ingredients",
    Base.metadata,
    Column("product_id", String(64), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("ingredient_id", Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), primary_key=True),
)


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    scientific_name = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    safety_rating = Column(String(50), default="Clean / Skin-Safe")
    is_active_ingredient = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    products = relationship("Product", secondary=product_ingredients, back_populates="ingredients")
