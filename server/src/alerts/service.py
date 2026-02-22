from sqlalchemy.orm import Session
from .models import Alert

def get_alerts(db: Session):
    """
    Get all alerts ordered by creation date
    """
    return db.query(Alert).order_by(Alert.created_at.desc()).all()

def get_alert_by_id(db: Session, alert_id: int):
    """
    Get alert by ID
    """
    return db.query(Alert).filter(Alert.id == alert_id).first()

def mark_read(db: Session, alert_id: int):
    """
    Mark alert as read
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = "read"
        db.commit()
        db.refresh(alert)
    return alert

def update_alert_status(db: Session, alert_id: int, status: str):
    """
    Update alert status
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
        db.refresh(alert)
    return alert

def get_alert_stats(db: Session):
    """
    Get alert statistics
    """
    total = db.query(Alert).count()
    unread = db.query(Alert).filter(Alert.status == "unread").count()
    low_balance = db.query(Alert).filter(Alert.type == "low_balance").count()
    bill_due = db.query(Alert).filter(Alert.type == "bill_due").count()
    budget_exceeded = db.query(Alert).filter(Alert.type == "budget_exceeded").count()
    
    return {
        "total": total,
        "unread": unread,
        "by_type": {
            "low_balance": low_balance,
            "bill_due": bill_due,
            "budget_exceeded": budget_exceeded
        }
    }

