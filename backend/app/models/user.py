from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(30), default="customer", nullable=False)  # "customer" | "admin"
    is_active = Column(Boolean, default=True, nullable=False)

    # Saved Skin Profile & Preferences
    skin_type = Column(String(50), default="All", nullable=True)
    skin_concerns = Column(JSON, default=list)  # e.g. ["Dullness", "Redness"]
    sensitivity_level = Column(String(50), default="Moderate", nullable=True)  # "Low", "Moderate", "High"
    known_allergens = Column(JSON, default=list)  # e.g. ["Fragrance", "Essential Oils"]
    preferred_routine = Column(String(50), default="Clean Botanical", nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
