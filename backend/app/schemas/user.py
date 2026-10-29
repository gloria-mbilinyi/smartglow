from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = None


class SkinPreferencesUpdate(BaseModel):
    skin_type: Optional[str] = Field("All", max_length=50)
    skin_concerns: List[str] = Field(default_factory=list)
    sensitivity_level: Optional[str] = Field("Moderate", max_length=50)
    known_allergens: List[str] = Field(default_factory=list)
    preferred_routine: Optional[str] = Field("Clean Botanical", max_length=50)


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    skin_type: Optional[str] = "All"
    skin_concerns: List[str] = []
    sensitivity_level: Optional[str] = "Moderate"
    known_allergens: List[str] = []
    preferred_routine: Optional[str] = "Clean Botanical"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
