from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.core import SessionLocal
from .service import get_settings

router = APIRouter(prefix="/admin/settings")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def settings(db: Session = Depends(get_db)):
    return get_settings(db)
