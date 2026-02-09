from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.core import SessionLocal
from .service import get_users, update_status

router = APIRouter(prefix="/admin/users")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_users(db: Session = Depends(get_db)):
    return get_users(db)

@router.patch("/{user_id}/status")
def change_status(user_id: int, status: str, db: Session = Depends(get_db)):
    return update_status(db, user_id, status)
