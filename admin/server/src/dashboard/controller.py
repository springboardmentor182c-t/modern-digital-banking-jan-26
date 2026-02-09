from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.core import SessionLocal
from .service import stats

router = APIRouter(prefix="/admin/dashboard")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    return stats(db)
