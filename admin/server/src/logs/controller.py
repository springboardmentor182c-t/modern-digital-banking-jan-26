from fastapi import APIRouter
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database.core import DB_AVAILABLE, SessionLocal

# Mock data for demo when database is unavailable
MOCK_LOGS = [
    {"id": 1, "admin_id": "1", "admin_name": "Admin User", "action": "LOGIN", "target_type": None, "target_id": None, "target_name": None, "details": "Admin logged in successfully", "timestamp": "2025-01-26 10:30:00"},
    {"id": 2, "admin_id": "1", "admin_name": "Admin User", "action": "VIEW_USERS", "target_type": "User", "target_id": 1, "target_name": "John Doe", "details": "Viewed user details", "timestamp": "2025-01-26 10:35:00"},
    {"id": 3, "admin_id": "1", "admin_name": "Admin User", "action": "UPDATE_STATUS", "target_type": "User", "target_id": 3, "target_name": "Bob Wilson", "details": "Updated user status to suspended", "timestamp": "2025-01-26 11:00:00"},
    {"id": 4, "admin_id": "1", "admin_name": "Admin User", "action": "VIEW_ALERTS", "target_type": "Alert", "target_id": None, "target_name": None, "details": "Viewed alerts dashboard", "timestamp": "2025-01-26 11:15:00"},
    {"id": 5, "admin_id": "1", "admin_name": "Admin User", "action": "MARK_READ", "target_type": "Alert", "target_id": 2, "target_name": "Bill Due Alert", "details": "Marked alert as read", "timestamp": "2025-01-26 11:20:00"},
]

# Pydantic schemas
class LogResponse(BaseModel):
    id: int
    admin_id: Optional[str] = None
    admin_name: Optional[str] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    target_name: Optional[str] = None
    details: Optional[str] = None
    timestamp: Optional[str] = None

class LogsListResponse(BaseModel):
    logs: List[LogResponse]
    total: int

class LogStatsResponse(BaseModel):
    total: int
    today: int
    this_week: int
    this_month: int

router = APIRouter(prefix="/admin/logs", tags=["Logs"])

@router.get("/", response_model=LogsListResponse)
async def list_logs(action_filter: Optional[str] = None):
    """
    Get list of admin activity logs
    """
    # Use mock data if database is unavailable
    if not DB_AVAILABLE:
        logs = MOCK_LOGS.copy()
        
        # Apply filters if provided
        if action_filter and action_filter != "all":
            if action_filter == "user":
                logs = [l for l in logs if "user" in l["action"].lower()]
            elif action_filter == "alert":
                logs = [l for l in logs if "alert" in l["action"].lower()]
            elif action_filter == "settings":
                logs = [l for l in logs if "settings" in l["action"].lower()]
            elif action_filter == "report":
                logs = [l for l in logs if "report" in l["action"].lower()]
        
        return {
            "logs": logs,
            "total": len(logs)
        }
    
    # Use database
    db = SessionLocal()
    try:
        from .service import get_logs as get_logs_service
        
        logs = get_logs_service(db)
        
        # Apply filters if provided
        if action_filter and action_filter != "all":
            if action_filter == "user":
                logs = [l for l in logs if "user" in l.action.lower() or 
                        (l.target_type and "user" in l.target_type.lower())]
            elif action_filter == "alert":
                logs = [l for l in logs if "alert" in l.action.lower() or 
                        (l.target_type and "alert" in l.target_type.lower())]
            elif action_filter == "settings":
                logs = [l for l in logs if "settings" in l.action.lower() or 
                        (l.target_type and "settings" in l.target_type.lower())]
            elif action_filter == "report":
                logs = [l for l in logs if "report" in l.action.lower() or 
                        (l.target_type and "report" in l.target_type.lower())]
        
        # Format logs for response
        log_responses = []
        for log in logs:
            log_responses.append({
                "id": log.id,
                "admin_id": getattr(log, 'admin_id', None),
                "admin_name": getattr(log, 'admin_name', None),
                "action": log.action,
                "target_type": getattr(log, 'target_type', None),
                "target_id": getattr(log, 'target_id', None),
                "target_name": getattr(log, 'target_name', None),
                "details": getattr(log, 'details', None),
                "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M:%S") if log.created_at else None
            })
        
        return {
            "logs": log_responses,
            "total": len(log_responses)
        }
    finally:
        db.close()

@router.get("/stats", response_model=LogStatsResponse)
async def get_log_stats():
    """
    Get log statistics
    """
    # Use mock stats if database is unavailable
    if not DB_AVAILABLE:
        return {
            "total": len(MOCK_LOGS),
            "today": 5,
            "this_week": 5,
            "this_month": 5
        }
    
    db = SessionLocal()
    try:
        from .service import get_log_stats as get_stats
        return get_stats(db)
    finally:
        db.close()

# Import model for queries
from .models import AdminLog

