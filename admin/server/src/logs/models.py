from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from ..database.core import Base

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True)
    action = Column(String)
    target = Column(String)
    admin_id = Column(String, nullable=True)
    admin_name = Column(String, nullable=True)
    details = Column(String, nullable=True)
    target_id = Column(Integer, nullable=True)
    target_name = Column(String, nullable=True)
    target_type = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

