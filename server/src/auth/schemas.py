from pydantic import BaseModel, EmailStr
from typing import Optional
from src.auth.models import KYCStatus
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    phone: Optional[str]
    kyc_status: KYCStatus
    created_at: datetime

    class Config:
        from_attributes = True
