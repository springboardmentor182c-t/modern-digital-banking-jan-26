"""
Dashboard router — real DB queries + mock fallback + CSV export.
"""

import csv
import io
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..database.core import DB_AVAILABLE, SessionLocal

# ---------------------------------------------------------------------------
# Mock data (used when DB unavailable)
# ---------------------------------------------------------------------------
MOCK_STATS = {
    "total_users": 1284,
    "active_users": 942,
    "linked_accounts": 3721,
    "alerts_triggered": 218,
    "growth_rate": {"users": 12, "accounts": 8, "alerts": -4}
}

MOCK_USER_GROWTH = [
    {"month": "Aug", "users": 820}, {"month": "Sep", "users": 910},
    {"month": "Oct", "users": 980}, {"month": "Nov", "users": 1050},
    {"month": "Dec", "users": 1120}, {"month": "Jan", "users": 1200},
    {"month": "Feb", "users": 1284},
]

MOCK_ALERT_TRENDS = [
    {"month": "Aug", "low_balance": 18, "bill_due": 24, "budget_exceeded": 12},
    {"month": "Sep", "low_balance": 22, "bill_due": 19, "budget_exceeded": 15},
    {"month": "Oct", "low_balance": 15, "bill_due": 28, "budget_exceeded": 20},
    {"month": "Nov", "low_balance": 30, "bill_due": 22, "budget_exceeded": 18},
    {"month": "Dec", "low_balance": 25, "bill_due": 35, "budget_exceeded": 22},
    {"month": "Jan", "low_balance": 20, "bill_due": 30, "budget_exceeded": 16},
    {"month": "Feb", "low_balance": 28, "bill_due": 26, "budget_exceeded": 24},
]

MOCK_ALERT_DISTRIBUTION = [
    {"name": "Low Balance", "value": 98, "fill": "#f4a4a4"},
    {"name": "Bill Due", "value": 76, "fill": "#ffd4a3"},
    {"name": "Budget Exceeded", "value": 44, "fill": "#7eb9e3"},
]

MOCK_TOP_CATEGORIES = [
    {"category": "Low Balance Alerts", "count": 98, "trend": "up"},
    {"category": "Bill Due Reminders", "count": 76, "trend": "stable"},
    {"category": "Budget Exceeded", "count": 44, "trend": "down"},
]

MOCK_RECENT_ALERTS = [
    {"id": 1, "user_name": "Alice Johnson", "type": "low_balance", "message": "Balance below ₹500", "severity": "high", "status": "unread", "timestamp": "2026-03-01T10:30:00"},
    {"id": 2, "user_name": "Carol Smith", "type": "bill_due", "message": "Electricity bill due in 2 days", "severity": "medium", "status": "unread", "timestamp": "2026-03-01T09:00:00"},
    {"id": 3, "user_name": "Eva Williams", "type": "budget_exceeded", "message": "Dining budget exceeded by 15%", "severity": "medium", "status": "read", "timestamp": "2026-02-29T18:45:00"},
    {"id": 4, "user_name": "Bob Martinez", "type": "low_balance", "message": "Savings account critically low", "severity": "high", "status": "unread", "timestamp": "2026-02-29T14:20:00"},
]

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/admin/dashboard", tags=["Dashboard"])

MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics."""
    if not DB_AVAILABLE:
        return {
            "stats": MOCK_STATS,
            "user_growth": MOCK_USER_GROWTH,
            "alert_trends": MOCK_ALERT_TRENDS,
            "alert_distribution": MOCK_ALERT_DISTRIBUTION,
            "top_categories": MOCK_TOP_CATEGORIES,
            "recent_alerts": MOCK_RECENT_ALERTS,
        }

    db = SessionLocal()
    try:
        from ..models.user import User
        from ..alerts.models import Alert

        total_users = db.query(User).count()
        active_users = total_users
        alerts_triggered = db.query(Alert).count()

        stats = {
            "total_users": total_users,
            "active_users": active_users,
            "linked_accounts": total_users,  # each user has at least 1 account
            "alerts_triggered": alerts_triggered,
            "growth_rate": {"users": 0, "accounts": 0, "alerts": 0},
        }

        # --- User growth: just static trend based on total for now ---
        user_growth = [
            {"month": "Jul", "users": max(0, total_users - 50)},
            {"month": "Aug", "users": max(0, total_users - 40)},
            {"month": "Sep", "users": max(0, total_users - 30)},
            {"month": "Oct", "users": max(0, total_users - 20)},
            {"month": "Nov", "users": max(0, total_users - 10)},
            {"month": "Dec", "users": total_users}
        ]

        # --- Alert trends: static trend for now ---
        alert_trends = [
            {"month": "Jul", "low_balance": 18, "bill_due": 24, "budget_exceeded": 12},
            {"month": "Aug", "low_balance": 22, "bill_due": 19, "budget_exceeded": 15},
            {"month": "Sep", "low_balance": 15, "bill_due": 28, "budget_exceeded": 20},
            {"month": "Oct", "low_balance": 30, "bill_due": 22, "budget_exceeded": 18},
            {"month": "Nov", "low_balance": 25, "bill_due": 35, "budget_exceeded": 22},
            {"month": "Dec", "low_balance": 20, "bill_due": 30, "budget_exceeded": 16},
        ]

        # --- Alert distribution ---
        lb = db.query(Alert).filter(Alert.type == "low_balance").count()
        bd = db.query(Alert).filter(Alert.type == "bill_due").count()
        be = db.query(Alert).filter(Alert.type == "budget_exceeded").count()
        alert_distribution = [
            {"name": "Low Balance", "value": lb, "fill": "#f4a4a4"},
            {"name": "Bill Due", "value": bd, "fill": "#ffd4a3"},
            {"name": "Budget Exceeded", "value": be, "fill": "#7eb9e3"},
        ]

        # --- Top categories (reuse alert distribution) ---
        top_categories = [
            {"category": "Low Balance Alerts", "count": lb, "trend": "up"},
            {"category": "Bill Due Reminders", "count": bd, "trend": "stable"},
            {"category": "Budget Exceeded", "count": be, "trend": "down"},
        ]

        # --- Recent alerts (can't order by created_at) ---
        recent = db.query(Alert).limit(4).all()
        recent_alerts = [
            {
                "id": a.id,
                "user_name": a.user_name or "Unknown",
                "type": a.type,
                "message": a.message,
                "severity": a.severity,
                "status": a.status,
                "timestamp": None,
            }
            for a in recent
        ]

        return {
            "stats": stats,
            "user_growth": user_growth,
            "alert_trends": alert_trends,
            "alert_distribution": alert_distribution,
            "top_categories": top_categories,
            "recent_alerts": recent_alerts,
        }
    finally:
        db.close()


@router.get("/health")
async def health_check():
    """System health check."""
    db_ok = False
    if DB_AVAILABLE:
        try:
            db = SessionLocal()
            db.execute(__import__("sqlalchemy").text("SELECT 1"))
            db.close()
            db_ok = True
        except Exception:
            pass
    return {
        "status": "operational",
        "api_response_time": None,
        "database_health": 100 if db_ok else None,
        "database_connected": db_ok,
    }


@router.get("/export/csv")
async def export_dashboard_csv():
    """Export dashboard summary stats as CSV."""
    if not DB_AVAILABLE:
        stats = MOCK_STATS
    else:
        db = SessionLocal()
        try:
            from ..models.user import User
            from ..alerts.models import Alert
            stats = {
                "total_users": db.query(User).count(),
                "active_users": db.query(User).count(),
                "linked_accounts": db.query(User).count(),
                "alerts_triggered": db.query(Alert).count(),
                "growth_rate": "N/A",
            }
        finally:
            db.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Metric", "Value"])
    for k, v in stats.items():
        writer.writerow([k.replace("_", " ").title(), v])
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dashboard_summary.csv"},
    )
