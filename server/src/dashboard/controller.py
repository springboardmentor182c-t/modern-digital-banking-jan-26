from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from pydantic import BaseModel
from datetime import datetime, timedelta
from ..database.core import DB_AVAILABLE, SessionLocal, is_database_available

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


def get_user_growth_data(db: Session, months: int = 6) -> List[dict]:
    """Get user growth data for the last N months"""
    from src.models.user import User
    
    result = []
    now = datetime.now()
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i in range(months - 1, -1, -1):
        # Calculate the target month
        target_date = now - timedelta(days=30 * i)
        month = target_date.month
        year = target_date.year
        
        # Count users created up to that month
        count = db.query(User).filter(
            extract('year', User.created_at) <= year,
            extract('month', User.created_at) <= month
        ).count() if User.created_at else 0
        
        # Also try with is_verified as proxy for created_at if available
        if count == 0:
            count = db.query(User).count()
        
        result.append({
            "month": month_names[month - 1],
            "users": count
        })
    
    return result


def get_alert_trends_data(db: Session, months: int = 6) -> List[dict]:
    """Get alert trends by type for the last N months"""
    from src.alerts.models import Alert
    
    result = []
    now = datetime.now()
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i in range(months - 1, -1, -1):
        target_date = now - timedelta(days=30 * i)
        month = target_date.month
        year = target_date.year
        
        # Count alerts by type for this month
        low_balance = db.query(Alert).filter(
            Alert.type == "LOW_BALANCE",
            extract('year', Alert.created_at) == year,
            extract('month', Alert.created_at) == month
        ).count() if Alert.created_at else 0
        
        bill_due = db.query(Alert).filter(
            Alert.type == "BILL_DUE",
            extract('year', Alert.created_at) == year,
            extract('month', Alert.created_at) == month
        ).count() if Alert.created_at else 0
        
        budget_exceeded = db.query(Alert).filter(
            Alert.type == "BUDGET_EXCEEDED",
            extract('year', Alert.created_at) == year,
            extract('month', Alert.created_at) == month
        ).count() if Alert.created_at else 0
        
        result.append({
            "month": month_names[month - 1],
            "low_balance": low_balance,
            "bill_due": bill_due,
            "budget_exceeded": budget_exceeded
        })
    
    return result


def get_alert_distribution_data(db: Session) -> List[dict]:
    """Get alert distribution by type"""
    from src.alerts.models import Alert
    
    low_balance = db.query(Alert).filter(Alert.type == "LOW_BALANCE").count()
    bill_due = db.query(Alert).filter(Alert.type == "BILL_DUE").count()
    budget_exceeded = db.query(Alert).filter(Alert.type == "BUDGET_EXCEEDED").count()
    
    return [
        {"name": "Low Balance", "value": low_balance, "fill": "#ef4444"},
        {"name": "Bill Due", "value": bill_due, "fill": "#f97316"},
        {"name": "Budget Exceeded", "value": budget_exceeded, "fill": "#eab308"}
    ]


def get_recent_alerts(db: Session, limit: int = 10) -> List[dict]:
    """Get recent alerts from database"""
    from src.alerts.models import Alert
    
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()
    
    result = []
    for alert in alerts:
        result.append({
            "id": alert.id,
            "user_name": alert.user_name or "Unknown",
            "type": alert.type or "unknown",
            "message": alert.message or "",
            "severity": alert.severity or "low",
            "status": alert.status or "unread",
            "timestamp": alert.created_at.strftime("%Y-%m-%d %H:%M") if alert.created_at else ""
        })
    
    return result


def calculate_growth_rate(db: Session) -> dict:
    """Calculate growth rates for users, accounts, and alerts"""
    from src.models.user import User
    from src.models.user import Account
    from src.alerts.models import Alert
    
    now = datetime.now()
    last_month = now - timedelta(days=30)
    two_months_ago = now - timedelta(days=60)
    
    # User growth
    users_this_month = db.query(User).filter(User.created_at >= last_month).count() if User.created_at else 0
    users_last_month = db.query(User).filter(
        User.created_at >= two_months_ago,
        User.created_at < last_month
    ).count() if User.created_at else 0
    
    if users_last_month > 0:
        users_growth = round(((users_this_month - users_last_month) / users_last_month) * 100, 1)
    else:
        users_growth = 100 if users_this_month > 0 else 0
    
    # Account growth
    accounts_this_month = db.query(Account).filter(Account.created_at >= last_month).count() if Account.created_at else 0
    accounts_last_month = db.query(Account).filter(
        Account.created_at >= two_months_ago,
        Account.created_at < last_month
    ).count() if Account.created_at else 0
    
    if accounts_last_month > 0:
        accounts_growth = round(((accounts_this_month - accounts_last_month) / accounts_last_month) * 100, 1)
    else:
        accounts_growth = 100 if accounts_this_month > 0 else 0
    
    # Alert growth
    alerts_this_month = db.query(Alert).filter(Alert.created_at >= last_month).count() if Alert.created_at else 0
    alerts_last_month = db.query(Alert).filter(
        Alert.created_at >= two_months_ago,
        Alert.created_at < last_month
    ).count() if Alert.created_at else 0
    
    if alerts_last_month > 0:
        alerts_growth = round(((alerts_this_month - alerts_last_month) / alerts_last_month) * 100, 1)
    else:
        alerts_growth = 100 if alerts_this_month > 0 else 0
    
    return {
        "users": users_growth,
        "accounts": accounts_growth,
        "alerts": alerts_growth
    }


@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats():
    """
    Get comprehensive dashboard statistics from the database
    """
    # Always try to use the database - skip mock data entirely
    db = SessionLocal()
    try:
        # Import models from src/models/user.py (has proper User and Account models)
        from src.models.user import User, Account
        from src.alerts.models import Alert
        
        # Get total and active users
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_verified == True).count()
        
        # Get linked accounts count
        linked_accounts = db.query(Account).filter(Account.status == "Active").count()
        
        # Get total alerts
        alerts_triggered = db.query(Alert).count()
        
        # Calculate growth rates
        growth_rate = calculate_growth_rate(db)
        
        stats = {
            "total_users": total_users,
            "active_users": active_users,
            "linked_accounts": linked_accounts,
            "alerts_triggered": alerts_triggered,
            "growth_rate": growth_rate
        }
        
        # Get user growth data
        user_growth = get_user_growth_data(db)
        
        # Get alert trends
        alert_trends = get_alert_trends_data(db)
        
        # Get alert distribution
        alert_distribution = get_alert_distribution_data(db)
        
        # Get recent alerts
        recent_alerts = get_recent_alerts(db)
        
        # Top categories (placeholder - would need transaction data)
        top_categories = MOCK_TOP_CATEGORIES
        
        return {
            "stats": stats,
            "user_growth": user_growth,
            "alert_trends": alert_trends,
            "alert_distribution": alert_distribution,
            "top_categories": top_categories,
            "recent_alerts": recent_alerts
        }
    except Exception as e:
        # Log error and return empty data instead of mock data
        import logging
        logging.getLogger(__name__).error(f"Error fetching dashboard stats: {e}")
        import traceback
        traceback.print_exc()
        return {
            "stats": {
                "total_users": 0,
                "active_users": 0,
                "linked_accounts": 0,
                "alerts_triggered": 0,
                "growth_rate": {"users": 0, "accounts": 0, "alerts": 0},
                "error": str(e)
            },
            "user_growth": [],
            "alert_trends": [],
            "alert_distribution": [],
            "top_categories": [],
            "recent_alerts": []
        }
    finally:
        db.close()

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

