from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database.core import DB_AVAILABLE, SessionLocal

# Mock data for demo when database is unavailable
MOCK_ALERTS = [
    {"id": 1, "user_id": 1, "user_name": "John Doe", "type": "low_balance", "message": "Account balance below $100", "severity": "high", "status": "unread", "timestamp": "2025-01-26 09:00:00"},
    {"id": 2, "user_id": 2, "user_name": "Jane Smith", "type": "bill_due", "message": "Credit card payment due in 3 days", "severity": "medium", "status": "read", "timestamp": "2025-01-26 08:30:00"},
    {"id": 3, "user_id": 4, "user_name": "Alice Brown", "type": "budget_exceeded", "message": "Monthly spending exceeded budget", "severity": "low", "status": "unread", "timestamp": "2025-01-26 07:15:00"},
    {"id": 4, "user_id": 3, "user_name": "Bob Wilson", "type": "low_balance", "message": "Account balance critically low", "severity": "critical", "status": "unread", "timestamp": "2025-01-26 06:00:00"},
    {"id": 5, "user_id": 5, "user_name": "Charlie Davis", "type": "bill_due", "message": "Loan payment overdue", "severity": "high", "status": "unread", "timestamp": "2025-01-25 14:00:00"},
]

# Pydantic schemas
class AlertResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: str
    type: str
    message: str
    severity: str
    status: str
    timestamp: Optional[str] = None

class AlertTypeCount(BaseModel):
    low_balance: int
    bill_due: int
    budget_exceeded: int

class AlertsListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int
    type_counts: AlertTypeCount

class AlertStatusUpdate(BaseModel):
    status: str

router = APIRouter(prefix="/admin/alerts", tags=["Alerts"])

@router.get("/", response_model=AlertsListResponse)
async def list_alerts(
    type_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    status_filter: Optional[str] = None
):
    """
    Get list of alerts with optional filters
    """
    # Use mock data if database is unavailable
    if not DB_AVAILABLE:
        alerts = MOCK_ALERTS.copy()
        
        # Apply filters
        if type_filter:
            alerts = [a for a in alerts if a["type"] == type_filter]
        if severity_filter:
            alerts = [a for a in alerts if a["severity"] == severity_filter]
        if status_filter:
            alerts = [a for a in alerts if a["status"] == status_filter]
        
        # Count by type
        type_counts = {
            "low_balance": sum(1 for a in MOCK_ALERTS if a["type"] == "low_balance"),
            "bill_due": sum(1 for a in MOCK_ALERTS if a["type"] == "bill_due"),
            "budget_exceeded": sum(1 for a in MOCK_ALERTS if a["type"] == "budget_exceeded")
        }
        
        return {
            "alerts": alerts,
            "total": len(alerts),
            "type_counts": type_counts
        }
    
    # Use database
    db = SessionLocal()
    try:
        from .service import get_alerts as get_alerts_service
        
        alerts = get_alerts_service(db)
        
        # Apply filters
        if type_filter:
            alerts = [a for a in alerts if a.type == type_filter]
        if severity_filter:
            alerts = [a for a in alerts if a.severity == severity_filter]
        if status_filter:
            alerts = [a for a in alerts if a.status == status_filter]
        
        # Count by type
        type_counts = {
            "low_balance": sum(1 for a in alerts if a.type == "low_balance"),
            "bill_due": sum(1 for a in alerts if a.type == "bill_due"),
            "budget_exceeded": sum(1 for a in alerts if a.type == "budget_exceeded")
        }
        
        # Format alerts for response
        alert_responses = []
        for alert in alerts:
            alert_responses.append({
                "id": alert.id,
                "user_id": getattr(alert, 'user_id', None),
                "user_name": alert.user_name,
                "type": alert.type,
                "message": alert.message,
                "severity": alert.severity,
                "status": alert.status,
                "timestamp": alert.created_at.strftime("%Y-%m-%d %H:%M:%S") if alert.created_at else None
            })
        
        return {
            "alerts": alert_responses,
            "total": len(alert_responses),
            "type_counts": type_counts
        }
    finally:
        db.close()

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: int):
    """
    Get alert by ID
    """
    if not DB_AVAILABLE:
        alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return alert
    
    db = SessionLocal()
    try:
        from .service import get_alert_by_id
        
        alert = get_alert_by_id(db, alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {
            "id": alert.id,
            "user_id": getattr(alert, 'user_id', None),
            "user_name": alert.user_name,
            "type": alert.type,
            "message": alert.message,
            "severity": alert.severity,
            "status": alert.status,
            "timestamp": alert.created_at.strftime("%Y-%m-%d %H:%M:%S") if alert.created_at else None
        }
    finally:
        db.close()

@router.patch("/{alert_id}/read")
async def mark_alert_read(alert_id: int):
    """
    Mark alert as read
    """
    if not DB_AVAILABLE:
        alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"message": "Alert marked as read", "alert_id": alert_id}
    
    db = SessionLocal()
    try:
        from .service import mark_read
        
        alert = mark_read(db, alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert marked as read", "alert_id": alert_id}
    finally:
        db.close()

@router.patch("/{alert_id}/status")
async def update_alert_status(alert_id: int, status_update: AlertStatusUpdate):
    """
    Update alert status
    """
    valid_statuses = ["read", "unread"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    if not DB_AVAILABLE:
        alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"message": "Alert status updated", "alert_id": alert_id, "status": status_update.status}
    
    db = SessionLocal()
    try:
        from .service import update_alert_status as update_status
        
        alert = update_status(db, alert_id, status_update.status)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert status updated", "alert_id": alert_id, "status": status_update.status}
    finally:
        db.close()

# Import Alert model for queries
from .models import Alert

