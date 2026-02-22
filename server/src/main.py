"""Entry point - FastAPI application with all routers."""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.database.core import engine, Base, SessionLocal
from src.auth.controller import router as auth_router
from src.auth.kyc import router as kyc_router
from src.users.transactions import router as transactions_router
from src.models.user import Transaction

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(kyc_router, prefix="/kyc")
app.include_router(transactions_router, prefix="/api/transactions")


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
