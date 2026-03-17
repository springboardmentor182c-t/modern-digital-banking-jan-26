from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Banking API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
from src.database.core import engine, Base
from src.auth.controller import router as auth_router
from src.auth.kyc import router as kyc_router

# Import admin routers
from src.users.controller import router as users_router
from src.alerts.controller import router as alerts_router
from src.logs.controller import router as logs_router
from src.settings.controller import router as settings_router
from src.dashboard.controller import router as dashboard_router

# Import accounts router
from src.accounts.controller import router as accounts_router

Base.metadata.create_all(bind=engine)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Banking API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# Auth routes
app.include_router(auth_router, prefix="/auth")
app.include_router(kyc_router, prefix="/kyc")

# Admin routes
app.include_router(users_router)
app.include_router(alerts_router)
app.include_router(logs_router)
app.include_router(settings_router)
app.include_router(dashboard_router)

# Accounts routes
app.include_router(accounts_router, prefix="/api/accounts")

# Transactions API (uses header based auth for now - send `Authorization: Bearer <user_id>` or `X-User-Id`)
from src.users.transactions import router as transactions_router
app.include_router(transactions_router, prefix="/api/transactions")

# Public endpoint to fetch all transactions (for frontend / direct calls)
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database.core import SessionLocal
from src.models.user import Transaction


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


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Digital Banking API is running"}


@app.get("/")
async def root():
    return {
        "name": "Digital Banking API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
