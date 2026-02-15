from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, ForeignKey, Date, Numeric
from sqlalchemy.sql import func
from src.database import Base
import enum

class BillStatus(str, enum.Enum):
    upcoming = "upcoming"
    paid = "paid"
    overdue = "overdue"

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    biller_name = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(BillStatus), default=BillStatus.upcoming)
    auto_pay = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    program_name = Column(String, nullable=False)
    points_balance = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
