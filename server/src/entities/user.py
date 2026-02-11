from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from sqlalchemy.sql import func
from src.database.core import Base
import enum

class KYCStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.unverified)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(TIMESTAMP, server_default=func.now())
