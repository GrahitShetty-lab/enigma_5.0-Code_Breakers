from pydantic import BaseModel, Field
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., example="Aniket Patil")
    phone: str = Field(..., example="+919876543210")
    preferred_language: str = "en"

class UserRegister(UserBase):
    password: str = Field(..., min_length=6, example="secret123")

class UserLogin(BaseModel):
    phone: str = Field(..., example="+919876543210")
    password: str = Field(..., example="secret123")

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
