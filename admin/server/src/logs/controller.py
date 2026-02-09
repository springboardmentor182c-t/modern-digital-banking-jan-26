from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.core import SessionLocal
from .service import get_logs

router = APIRouter(prefix="/admin/logs")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_logs(db: Session = Depends(get_db)):
    return get_logs(db)
