from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Todo(BaseModel):
    """Todo entity model"""
    id: Optional[int] = None
    user_id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
