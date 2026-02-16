from fastapi import FastAPI
from sqlalchemy import func
from datetime import datetime, timedelta
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
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 6))

        )
        db.add(txn)

    db.commit()
    db.close()

    return {"message": "Dummy data inserted"}
@app.delete("/clear")
def clear_data():
    db = SessionLocal()
    db.query(Transaction).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    return {"message": "All data cleared"}


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
# --------------------------------
# Admin Chart Data Endpoint
# --------------------------------
@app.get("/admin/chart-data")
def get_chart_data():
    db = SessionLocal()

    results = (
        db.query(
            func.date(Transaction.created_at).label("date"),
            func.count(Transaction.id).label("transactions"),
            func.sum(Transaction.amount).label("revenue")
        )
        .group_by(func.date(Transaction.created_at))
        .order_by(func.date(Transaction.created_at))
        .all()
    )

    chart_data = [
        {
            "date": str(row.date),
            "users": row.transactions,
            "revenue": float(row.revenue or 0)
        }
        for row in results
    ]

    db.close()
    return chart_data
# ------------------------------------
# System Info Endpoint
# ------------------------------------
import psutil
from sqlalchemy import text

@app.get("/admin/system-info")
def get_system_info():
    db = SessionLocal()

    # 1️⃣ Check database connection
    try:
        db.execute(text("SELECT 1"))
        database_status = "Online"
    except:
        database_status = "Offline"

    # 2️⃣ CPU + Memory usage
    cpu_usage = psutil.cpu_percent(interval=0.5)
    memory_usage = psutil.virtual_memory().percent
    disk_usage = psutil.disk_usage('/').percent

    # 3️⃣ Recent Activity from real transactions
    recent_transactions = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .limit(3)
        .all()
    )

    recent_activity = [
        {
            "message": f"{txn.description}",
            "amount": txn.amount,
            "date": txn.created_at
        }
        for txn in recent_transactions
    ]

    db.close()

    return {
        "server_status": {
            "api": "Online",
            "database": database_status
        },
        "performance": {
            "cpu": cpu_usage,
            "memory": memory_usage,
            "storage": disk_usage
        },
        "recent_activity": recent_activity
    }
