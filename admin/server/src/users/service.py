from sqlalchemy.orm import Session
from typing import List
from .models import User
import random

def get_users(db: Session, skip: int = 0, limit: int = 50):
    """
    Get paginated list of users
    """
    return db.query(User).offset(skip).limit(limit).all()

def get_all_users(db: Session):
    """
    Get all users (for stats)
    """
    return db.query(User).all()

def get_user_by_id(db: Session, user_id: int):
    """
    Get user by ID
    """
    return db.query(User).filter(User.id == user_id).first()

def update_user_status(db: Session, user_id: int, status: str):
    """
    Update user status (active, suspended, inactive)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.status = status
        db.commit()
        db.refresh(user)
    return user

def get_user_stats(db: Session):
    """
    Get user statistics
    """
    total = db.query(User).count()
    active = db.query(User).filter(User.status == "active").count()
    suspended = db.query(User).filter(User.status == "suspended").count()
    inactive = db.query(User).filter(User.status == "inactive").count()
    verified_kyc = db.query(User).filter(User.kyc_status == "verified").count()
    pending_kyc = db.query(User).filter(User.kyc_status == "pending").count()
    
    return {
        "total": total,
        "active": active,
        "suspended": suspended,
        "inactive": inactive,
        "verified_kyc": verified_kyc,
        "pending_kyc": pending_kyc
    }

