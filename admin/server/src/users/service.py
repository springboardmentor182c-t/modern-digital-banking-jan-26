from sqlalchemy.orm import Session
from .models import User

def get_users(db: Session):
    return db.query(User).all()

def update_status(db: Session, user_id: int, status: str):
    user = db.query(User).get(user_id)
    user.status = status
    db.commit()
    return user
