from pydantic import BaseModel
from typing import Optional
from src.transactions.models import TransactionType
from datetime import datetime

class TransactionBase(BaseModel):
    account_id: int
    description: str
    category: Optional[str] = None
    amount: float
    currency: str = "USD"
    txn_type: TransactionType
    merchant: Optional[str] = None
    txn_date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    posted_date: datetime

    class Config:
        from_attributes = True
