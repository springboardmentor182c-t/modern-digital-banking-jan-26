"""
Alerts admin router — list, mark read, status update, CSV export.
Falls back to mock data when DB is unavailable.
"""

import csv
import io
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..database.core import DB_AVAILABLE, SessionLocal

# ---------------------------------------------------------------------------
# Mock data fallback
# ---------------------------------------------------------------------------
MOCK_ALERTS = [
    {"id": 1, "user_id": 1, "user_name": "Alice Johnson", "type": "low_balance", "message": "Account balance dropped below ₹500", "severity": "high", "status": "unread", "timestamp": "2026-03-01T10:30:00"},
    {"id": 2, "user_id": 3, "user_name": "Carol Smith",   "type": "bill_due",    "message": "Electricity bill due in 2 days",     "severity": "medium", "status": "unread", "timestamp": "2026-03-01T09:00:00"},
    {"id": 3, "user_id": 5, "user_name": "Eva Williams",  "type": "budget_exceeded", "message": "Dining budget exceeded by 15%",  "severity": "medium", "status": "read",   "timestamp": "2026-02-29T18:45:00"},
    {"id": 4, "user_id": 2, "user_name": "Bob Martinez",  "type": "low_balance", "message": "Savings account balance critically low", "severity": "high", "status": "unread", "timestamp": "2026-02-29T14:20:00"},
    {"id": 5, "user_id": 7, "user_name": "Grace Chen",    "type": "bill_due",    "message": "Internet bill due tomorrow",          "severity": "low",  "status": "read",   "timestamp": "2026-02-28T08:00:00"},
    {"id": 6, "user_id": 6, "user_name": "Frank Nguyen",  "type": "budget_exceeded", "message": "Shopping budget exceeded by ₹2,300", "severity": "medium", "status": "unread", "timestamp": "2026-02-27T20:10:00"},
]

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/admin/alerts", tags=["Alerts"])


def _fmt(dt) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.isoformat()


@router.get("/export/csv")
async def export_alerts_csv():
    """Export all alerts as a downloadable CSV file."""
    if not DB_AVAILABLE:
        rows = MOCK_ALERTS
    else:
        db = SessionLocal()
        try:
            from .models import Alert
            alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
            rows = [
                {
                    "id": a.id,
                    "user_id": getattr(a, "user_id", "") or "",
                    "user_name": a.user_name or "",
                    "type": a.type,
                    "message": a.message,
                    "severity": a.severity,
                    "status": a.status,
                    "timestamp": _fmt(a.created_at) or "",
                }
                for a in alerts
            ]
        finally:
            db.close()

    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "user_id", "user_name", "type", "message",
                    "severity", "status", "timestamp"],
        extrasaction="ignore",
    )
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alerts.csv"},
    )


@router.get("/", response_model=AlertsListResponse)
async def list_alerts(
    type_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
):
    """Get list of alerts with optional filters."""
    if not DB_AVAILABLE:
        alerts = MOCK_ALERTS.copy()
        if type_filter:
            alerts = [a for a in alerts if a["type"] == type_filter]
        if severity_filter:
            alerts = [a for a in alerts if a["severity"] == severity_filter]
        if status_filter:
            alerts = [a for a in alerts if a["status"] == status_filter]
        type_counts = {
            "low_balance": sum(1 for a in MOCK_ALERTS if a["type"] == "low_balance"),
            "bill_due": sum(1 for a in MOCK_ALERTS if a["type"] == "bill_due"),
            "budget_exceeded": sum(1 for a in MOCK_ALERTS if a["type"] == "budget_exceeded"),
        }
        return {"alerts": alerts, "total": len(alerts), "type_counts": type_counts}

    db = SessionLocal()
    try:
        from .models import Alert
        query = db.query(Alert).order_by(Alert.created_at.desc())
        if type_filter:
            query = query.filter(Alert.type == type_filter)
        if severity_filter:
            query = query.filter(Alert.severity == severity_filter)
        if status_filter:
            query = query.filter(Alert.status == status_filter)
        alerts_db = query.all()

        alert_responses = [
            {
                "id": a.id,
                "user_id": getattr(a, "user_id", None),
                "user_name": a.user_name or "Unknown",
                "type": a.type,
                "message": a.message,
                "severity": a.severity,
                "status": a.status,
                "timestamp": _fmt(a.created_at),
            }
            for a in alerts_db
        ]

        all_alerts = db.query(Alert).all()
        type_counts = {
            "low_balance": sum(1 for a in all_alerts if a.type == "low_balance"),
            "bill_due": sum(1 for a in all_alerts if a.type == "bill_due"),
            "budget_exceeded": sum(1 for a in all_alerts if a.type == "budget_exceeded"),
        }

        return {"alerts": alert_responses, "total": len(alert_responses), "type_counts": type_counts}
    finally:
        db.close()


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: int):
    """Get alert by ID."""
    if not DB_AVAILABLE:
        alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return alert

    db = SessionLocal()
    try:
        from .models import Alert
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"id": alert.id, "user_id": getattr(alert, "user_id", None),
                "user_name": alert.user_name, "type": alert.type, "message": alert.message,
                "severity": alert.severity, "status": alert.status, "timestamp": _fmt(alert.created_at)}
    finally:
        db.close()


@router.patch("/{alert_id}/read")
async def mark_alert_read(alert_id: int):
    """Mark alert as read."""
    if not DB_AVAILABLE:
        alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        alert["status"] = "read"
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
    """Update alert status."""
    valid_statuses = ["read", "unread"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400,
                            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    if not DB_AVAILABLE:
        alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        alert["status"] = status_update.status
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
