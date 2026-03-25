from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Auth Schemas
class RegisterSchema(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str
    password: str = Field(..., min_length=6)
    terms_accepted: bool


class OTPSchema(BaseModel):
    user_id: int
    otp: str = Field(..., min_length=6, max_length=6)


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class VerifyResetOTPSchema(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class ResetPasswordSchema(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=6)


class AdminLoginSchema(BaseModel):
    email: EmailStr
    password: str


# Transaction Schema
class TransactionSchema(BaseModel):
    id: Optional[int] = None
    user_id: int
    date: str
    merchant: Optional[str] = None
    category: Optional[str] = None
    type: str  # 'debit' or 'credit'
    amount: float
    status: str  # 'completed' or 'pending'
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# Budget Schemas
class BudgetBaseSchema(BaseModel):
    category: str
    limit: float
    icon: Optional[str] = None

class BudgetCreateSchema(BudgetBaseSchema):
    spent: Optional[float] = 0.0

class BudgetUpdateSchema(BaseModel):
    limit: Optional[float] = None
    spent: Optional[float] = None
    category: Optional[str] = None
    icon: Optional[str] = None

class BudgetSchema(BudgetBaseSchema):
    id: int
    user_id: int
    spent: float
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

# KYC Schemas
class IdentityUploadSchema(BaseModel):
    user_id: int


class AddressUploadSchema(BaseModel):
    user_id: int
    street: str
    city: str
    state: str
    zip_code: str
