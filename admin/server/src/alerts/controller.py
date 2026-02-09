from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.core import SessionLocal
from .service import get_alerts, mark_read

router = APIRouter(prefix="/admin/alerts")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_alerts(db: Session = Depends(get_db)):
    return get_alerts(db)

@router.patch("/{alert_id}/read")
def read_alert(alert_id: int, db: Session = Depends(get_db)):
    return mark_read(db, alert_id)
