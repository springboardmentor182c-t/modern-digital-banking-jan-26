from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database.core import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    user_name = Column(String)
    type = Column(String)
    message = Column(String)
    severity = Column(String)
    status = Column(String, default="unread")
    created_at = Column(DateTime, server_default=func.now())
