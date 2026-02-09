from sqlalchemy.orm import Session
from .models import Alert

def get_alerts(db: Session):
    return db.query(Alert).all()

def mark_read(db: Session, alert_id: int):
    alert = db.query(Alert).get(alert_id)
    alert.status = "read"
    db.commit()
    return alert
