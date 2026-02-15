from pydantic import BaseModel
from typing import Optional
from src.bills.models import BillStatus
from datetime import date, datetime

class BillBase(BaseModel):
    biller_name: str
    due_date: date
    amount_due: float
    status: BillStatus
    auto_pay: bool

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class RewardBase(BaseModel):
    program_name: str
    points_balance: int

class RewardResponse(RewardBase):
    id: int
    last_updated: datetime
    class Config:
        from_attributes = True
