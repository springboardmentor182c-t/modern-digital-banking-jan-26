from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    month: int
    year: int
    category: str
    limit_amount: float

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    spent_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True
