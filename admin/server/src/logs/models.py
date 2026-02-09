from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.core import Base

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True)
    action = Column(String)
    target = Column(String)
    created_at = Column(DateTime, server_default=func.now())
