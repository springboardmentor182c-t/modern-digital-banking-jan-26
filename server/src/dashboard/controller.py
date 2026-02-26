from fastapi import APIRouter
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..database.core import DB_AVAILABLE, SessionLocal

# Mock data for demo when database is unavailable
MOCK_STATS = {
    "total_users": 1250,
    "active_users": 892,
    "linked_accounts": 2150,
    "alerts_triggered": 156,
    "growth_rate": {
        "users": 12.5,
        "accounts": 8.3,
        "alerts": -5.2
    }
}

MOCK_USER_GROWTH = [
    {"month": "Aug", "users": 520},
    {"month": "Sep", "users": 650},
    {"month": "Oct", "users": 780},
    {"month": "Nov", "users": 920},
    {"month": "Dec", "users": 1050},
    {"month": "Jan", "users": 1250}
]

MOCK_ALERT_TRENDS = [
    {"month": "Aug", "low_balance": 45, "bill_due": 32, "budget_exceeded": 28},
    {"month": "Sep", "low_balance": 52, "bill_due": 38, "budget_exceeded": 35},
    {"month": "Oct", "low_balance": 48, "bill_due": 41, "budget_exceeded": 42},
    {"month": "Nov", "low_balance": 61, "bill_due": 35, "budget_exceeded": 38},
    {"month": "Dec", "low_balance": 55, "bill_due": 48, "budget_exceeded": 45},
    {"month": "Jan", "low_balance": 67, "bill_due": 52, "budget_exceeded": 50}
]

MOCK_ALERT_DISTRIBUTION = [
    {"name": "Low Balance", "value": 67, "fill": "#ef4444"},
    {"name": "Bill Due", "value": 52, "fill": "#f97316"},
    {"name": "Budget Exceeded", "value": 50, "fill": "#eab308"}
]

MOCK_TOP_CATEGORIES = [
    {"category": "Food & Dining", "count": 245, "trend": "up"},
    {"category": "Shopping", "count": 189, "trend": "up"},
    {"category": "Transportation", "count": 156, "trend": "down"},
    {"category": "Entertainment", "count": 134, "trend": "stable"},
    {"category": "Bills & Utilities", "count": 98, "trend": "up"}
]

MOCK_RECENT_ALERTS = [
    {"id": 1, "user_name": "John Doe", "type": "low_balance", "message": "Balance below $100", "severity": "high", "status": "unread"},
    {"id": 2, "user_name": "Jane Smith", "type": "bill_due", "message": "Payment due in 3 days", "severity": "medium", "status": "read"},
    {"id": 3, "user_name": "Alice Brown", "type": "budget_exceeded", "message": "Monthly budget exceeded", "severity": "low", "status": "unread"}
]

# Pydantic schemas
class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    linked_accounts: int
    alerts_triggered: int
    growth_rate: dict

class UserGrowthItem(BaseModel):
    month: str
    users: int

class AlertTrendItem(BaseModel):
    month: str
    low_balance: int
    bill_due: int
    budget_exceeded: int

class AlertDistributionItem(BaseModel):
    name: str
    value: int
    fill: str

class TopCategoryItem(BaseModel):
    category: str
    count: int
    trend: str

class DashboardResponse(BaseModel):
    stats: DashboardStats
    user_growth: List[UserGrowthItem]
    alert_trends: List[AlertTrendItem]
    alert_distribution: List[AlertDistributionItem]
    top_categories: List[TopCategoryItem]
    recent_alerts: List[dict]

router = APIRouter(prefix="/admin/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats():
    """
    Get comprehensive dashboard statistics
    """
    # Use mock data if database is unavailable
    if not DB_AVAILABLE:
        return {
            "stats": MOCK_STATS,
            "user_growth": MOCK_USER_GROWTH,
            "alert_trends": MOCK_ALERT_TRENDS,
            "alert_distribution": MOCK_ALERT_DISTRIBUTION,
            "top_categories": MOCK_TOP_CATEGORIES,
            "recent_alerts": MOCK_RECENT_ALERTS
        }
    
    # In production, these would come from actual database queries
    # For now, return structured data matching frontend expectations
    
    stats = {
        "total_users": 0,
        "active_users": 0,
        "linked_accounts": 0,
        "alerts_triggered": 0,
        "growth_rate": {
            "users": 0,
            "accounts": 0,
            "alerts": 0
        }
    }
    
    db = SessionLocal()
    try:
        # Try to get real data from database if available
        try:
            from ..users.models import User
            from ..alerts.models import Alert
            
            stats["total_users"] = db.query(User).count()
            stats["active_users"] = db.query(User).filter(User.status == "active").count()
            stats["alerts_triggered"] = db.query(Alert).count()
        except Exception:
            pass
    finally:
        db.close()
    
    return {
        "stats": stats,
        "user_growth": [],
        "alert_trends": [],
        "alert_distribution": [],
        "top_categories": [],
        "recent_alerts": []
    }

@router.get("/health")
async def health_check():
    """
    System health check endpoint
    """
    return {
        "status": "operational",
        "api_response_time": None,
        "database_health": None
    }

