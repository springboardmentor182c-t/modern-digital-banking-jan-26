from fastapi import FastAPI
from src.database import engine, Base
from src.auth import router as auth_router
from src.kyc import router as kyc_router

Base.metadata.create_all(bind=engine)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow only the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth_router, prefix="/auth")
app.include_router(kyc_router, prefix="/kyc")

# Transactions API (uses header based auth for now - send `Authorization: Bearer <user_id>` or `X-User-Id`)
from src.routes.transactions import router as transactions_router
app.include_router(transactions_router, prefix="/api/transactions")

# Public endpoint to fetch all transactions (for frontend / direct calls)
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import SessionLocal
from src.models import Transaction


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

from fastapi.middleware.cors import CORSMiddleware

# ... after initializing your app = FastAPI() ...

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
