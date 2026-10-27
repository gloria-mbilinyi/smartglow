from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.ingredient import product_ingredients


class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    subtitle = Column(String(255), nullable=True)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    price = Column(Float, nullable=False)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)
    skin_types = Column(JSON, default=list)  # e.g. ["All", "Sensitive", "Normal"]
    skin_concerns = Column(JSON, default=list)  # e.g. ["Dullness", "Hyperpigmentation"]
    key_ingredients_list = Column(JSON, default=list)
    all_ingredients = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    benefits = Column(JSON, default=list)
    usage = Column(Text, nullable=True)
    volume = Column(String(60), nullable=True)
    stock_count = Column(Integer, default=0, nullable=False)
    image_url = Column(String(500), nullable=False)
    tag = Column(String(80), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    ingredients = relationship("Ingredient", secondary=product_ingredients, back_populates="products")
