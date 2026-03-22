"""Entry point - FastAPI application with all routers."""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.database.core import engine, Base, SessionLocal
from src.auth.controller import router as auth_router
from src.auth.kyc import router as kyc_router
from src.users.transactions import router as transactions_router
from src.users.budgets import router as budgets_router
from src.users.user_dashboard import router as user_dashboard_router
from src.models.user import Transaction, Budget

# Admin routers
from src.dashboard.controller import router as dashboard_router
from src.users.controller import router as users_router
from src.alerts.controller import router as alerts_router
from src.settings.controller import router as settings_router
from src.logs.controller import router as logs_router

# Import all models so Base.metadata.create_all creates every table
from src.logs.models import AdminLog          # noqa: F401
from src.alerts.models import Alert           # noqa: F401
from src.settings.models import Settings      # noqa: F401
from src.models.user import User as UsersUser # noqa: F401
from src.models.user import Budget            # noqa: F401

# Create all tables
Base.metadata.create_all(bind=engine)


# Seed default settings row if missing
def seed_settings():
    db = SessionLocal()
    try:
        from src.settings.models import Settings
        if not db.query(Settings).first():
            db.add(Settings(id=1))
            db.commit()
    except Exception:
        pass
    finally:
        db.close()

def seed_budgets():
    db = SessionLocal()
    try:
        from src.models.user import Budget, User
        if db.query(Budget).count() < 10:
            # First, check if there's any user to attach budgets to
            first_user = db.query(User).first()
            if first_user:
                seeds = [
                    {"category": "Food & Dining", "limit": 5000, "spent": 1200, "icon": "food-&-dining"},
                    {"category": "Shopping", "limit": 4000, "spent": 3800, "icon": "shopping"}, # At Risk
                    {"category": "Transportation", "limit": 2500, "spent": 800, "icon": "transportation"},
                    {"category": "Bills & Utilities", "limit": 8000, "spent": 8500, "icon": "bills-&-utilities"}, # Exceeded
                    {"category": "Entertainment", "limit": 3000, "spent": 2900, "icon": "entertainment"},
                    {"category": "Healthcare", "limit": 10000, "spent": 1000, "icon": "healthcare"},
                    {"category": "Travel", "limit": 15000, "spent": 0, "icon": "travel"},
                    {"category": "Groceries", "limit": 6000, "spent": 4500, "icon": "groceries"},
                    {"category": "Education", "limit": 5000, "spent": 1500, "icon": "education"},
                    {"category": "Personal Care", "limit": 2000, "spent": 1900, "icon": "personal-care"},
                ]
                for seed in seeds:
                    if not db.query(Budget).filter_by(user_id=first_user.id, category=seed["category"]).first():
                        db.add(Budget(
                            user_id=first_user.id,
                            category=seed["category"],
                            limit=seed["limit"],
                            spent=seed["spent"],
                            icon=seed["icon"]
                        ))
                db.commit()
    except Exception:
        pass
    finally:
        db.close()

seed_settings()
seed_budgets()

app = FastAPI(title="SmartBank API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routers
app.include_router(auth_router, prefix="/auth")
app.include_router(kyc_router, prefix="/kyc")
app.include_router(transactions_router, prefix="/api/transactions")
app.include_router(budgets_router, prefix="/api/budgets")
app.include_router(user_dashboard_router, prefix="/api/user-dashboard")

# Admin routers (each has its own /admin/... prefix internally)
app.include_router(dashboard_router)
app.include_router(users_router)
app.include_router(alerts_router)
app.include_router(settings_router)
app.include_router(logs_router)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    """Return all transactions as a JSON array (safe serializable types)."""
    txs = db.query(Transaction).order_by(Transaction.date.desc()).all()
    result = []
    for t in txs:
        result.append({
            "id": t.id,
            "date": t.date.isoformat() if getattr(t, 'date', None) else None,
            "merchant": t.merchant,
            "category": t.category,
            "type": t.type,
            "amount": float(t.amount) if getattr(t, 'amount', None) is not None else None,
            "status": t.status,
            "created_at": t.created_at.isoformat() if getattr(t, 'created_at', None) else None
        })
    return result
