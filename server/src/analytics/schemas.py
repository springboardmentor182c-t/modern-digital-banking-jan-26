from pydantic import BaseModel
from typing import List
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

class DailyForecast(BaseModel):
    date: str
    income: float
    expense: float

class PredictCashFlowResponse(BaseModel):
    predicted_balance: List[float]
    daily_forecast: List[DailyForecast]
