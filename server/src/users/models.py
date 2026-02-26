from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from ..database.core import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    status = Column(String, default="active")
    kyc_status = Column(String, default="unverified")
    created_at = Column(DateTime, server_default=func.now())
