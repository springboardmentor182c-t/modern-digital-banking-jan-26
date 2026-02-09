from pydantic import BaseModel

class RegisterSchema(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    password: str
    terms_accepted: bool

class OTPSchema(BaseModel):
    user_id: int
    otp: str

class AddressSchema(BaseModel):
    user_id: int
    street: str
    city: str
    state: str
    zip_code: str

class LoginSchema(BaseModel):
    email: str
    password: str

class ForgotPasswordSchema(BaseModel):
    email: str

class VerifyResetOTPSchema(BaseModel):
    email: str
    otp: str

class ResetPasswordSchema(BaseModel):
    email: str
    new_password: str

class AdminLoginSchema(BaseModel):
    """Schema for admin login request"""
    email: str
    password: str


# Transactions schemas
from typing import Optional
from datetime import date, datetime

class TransactionSchema(BaseModel):
    id: int
    user_id: int
    date: date
    merchant: str
    category: Optional[str]
    type: str
    amount: float
    status: str
    created_at: Optional[datetime]

class TransactionCreateSchema(BaseModel):
    date: date
    merchant: str
    category: Optional[str]
    type: str
    amount: float
    status: str

