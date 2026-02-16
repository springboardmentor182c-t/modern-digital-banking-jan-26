from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Numeric
from src.database.core import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    password = Column(String)
    is_verified = Column(Boolean, default=False)

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    otp = Column(String)

class IdentityDocument(Base):
    __tablename__ = "identity_documents"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    file_path = Column(String)

class AddressVerification(Base):
    __tablename__ = "address_verification"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    street = Column(String)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    proof_file = Column(String)

class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    otp = Column(String)
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)

class Admin(Base):
    """Admin user model for admin portal authentication"""
    __tablename__ = "admins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="ADMIN")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Transactions model
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    merchant = Column(String)
    category = Column(String)
    type = Column(String)  # 'debit' or 'credit'
    amount = Column(Numeric(14, 2))
    status = Column(String)  # 'completed' or 'pending'
    created_at = Column(DateTime, default=datetime.utcnow)
