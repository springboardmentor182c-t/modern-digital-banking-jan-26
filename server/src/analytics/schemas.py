from pydantic import BaseModel
from src.analytics.models import AlertType
from datetime import datetime

class AlertBase(BaseModel):
    type: AlertType
    message: str

class AlertResponse(AlertBase):
    id: int
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True
