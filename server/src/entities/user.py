from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    """User entity model"""
    id: Optional[int] = None
    email: str
    name: str
    password_hash: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
