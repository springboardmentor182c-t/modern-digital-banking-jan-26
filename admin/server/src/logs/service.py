from sqlalchemy.orm import Session
from .models import AdminLog

def get_logs(db: Session):
    return db.query(AdminLog).order_by(AdminLog.created_at.desc()).all()
