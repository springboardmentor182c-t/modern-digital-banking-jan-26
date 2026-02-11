from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .models import AdminLog

def get_logs(db: Session, limit: int = 100):
    """
    Get admin logs ordered by creation date (most recent first)
    """
    return db.query(AdminLog).order_by(AdminLog.created_at.desc()).limit(limit).all()

def create_log(db: Session, action: str, target: str = None, admin_id: str = None, 
               admin_name: str = None, details: str = None, target_id: int = None, 
               target_name: str = None, target_type: str = None):
    """
    Create a new admin log entry
    """
    log = AdminLog(
        action=action,
        target=target,
        admin_id=admin_id,
        admin_name=admin_name,
        details=details,
        target_id=target_id,
        target_name=target_name,
        target_type=target_type
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_log_stats(db: Session):
    """
    Get log statistics
    """
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    total = db.query(AdminLog).count()
    today = db.query(AdminLog).filter(AdminLog.created_at >= today_start).count()
    this_week = db.query(AdminLog).filter(AdminLog.created_at >= week_start).count()
    this_month = db.query(AdminLog).filter(AdminLog.created_at >= month_start).count()
    
    return {
        "total": total,
        "today": today,
        "this_week": this_week,
        "this_month": this_month
    }

