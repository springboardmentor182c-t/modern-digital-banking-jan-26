from pydantic import BaseModel
from typing import Optional

class UserModel(BaseModel):
    """User model for API"""
    name: str
    email: str
    password: Optional[str] = None
