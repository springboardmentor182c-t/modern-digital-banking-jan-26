from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    """User model"""
    id: Optional[int] = None
    email: str
    password: str
    name: str
    created_at: Optional[str] = None
