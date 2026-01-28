from pydantic import BaseModel
from typing import Optional

class TodoModel(BaseModel):
    """Todo model for API"""
    title: str
    description: Optional[str] = None
    completed: bool = False
