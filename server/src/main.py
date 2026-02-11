from fastapi import FastAPI
from sqlalchemy import func
from datetime import datetime
import random

from src.database.core import engine, Base, SessionLocal
from src.entities.user import User
from src.entities.transaction import Transaction, TransactionType

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables automatically
Base.metadata.create_all(bind=engine)


# ---------------------------------------
# Root Endpoint
# ---------------------------------------
@app.get("/")
def root():
    return {"message": "Banking Dashboard API Running"}


# ---------------------------------------
# Seed Dummy Data
# ---------------------------------------
@app.post("/seed")
def seed_data():
    db = SessionLocal()

    # Prevent duplicate seeding
    if db.query(User).count() > 0:
        db.close()
        return {"message": "Data already seeded"}

    # Create Users
    for i in range(1, 21):
        user = User(
            name=f"User {i}",
            email=f"user{i}@test.com",
            password="password123",
            role="admin" if i == 1 else "user"
        )
        db.add(user)

    db.commit()

    users = db.query(User).all()

    # Create Transactions
    for _ in range(200):
        txn = Transaction(
            user_id=random.choice(users).id,
            description="Test Transaction",
            category=random.choice(["Food", "Shopping", "Bills"]),
            amount=random.randint(100, 5000),
            txn_type=random.choice([TransactionType.debit, TransactionType.credit]),
            created_at=datetime.utcnow()
        )
        db.add(txn)

    db.commit()
    db.close()

    return {"message": "Dummy data inserted"}


# ---------------------------------------
# Admin Dashboard Endpoint
# ---------------------------------------
@app.get("/admin/dashboard")
def get_dashboard():
    db = SessionLocal()

    total_users = db.query(User).count()

    total_transactions = db.query(Transaction).count()

    total_revenue = db.query(
        func.sum(Transaction.amount)
    ).scalar() or 0

    active_users = db.query(User).filter(User.role == "user").count()

    active_rate = round((active_users / total_users) * 100, 2) if total_users else 0

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()

    recent_users_data = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
        for user in recent_users
    ]

    db.close()

    return {
        "total_users": total_users,
        "total_transactions": total_transactions,
        "total_revenue": float(total_revenue),
        "active_rate": active_rate,
        "recent_users": recent_users_data
    }
