from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., examples=["Aniket Patil"])
    phone: str = Field(..., examples=["+919876543210"])
    preferred_language: str = "en"

class UserRegister(UserBase):
    password: str = Field(..., min_length=6, examples=["secret123"])

# Alias for compatibility
UserCreate = UserRegister

class UserLogin(BaseModel):
    phone: str = Field(..., examples=["+919876543210"])
    password: str = Field(..., examples=["secret123"])

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
