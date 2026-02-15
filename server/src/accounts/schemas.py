from pydantic import BaseModel
from typing import Optional
from src.accounts.models import AccountType
from datetime import datetime

class AccountBase(BaseModel):
    bank_name: str
    account_type: AccountType
    masked_account: str
    currency: str = "USD"
    balance: float

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
