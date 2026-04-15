from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel
from store import load_data, save_data

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

# Models
class Budget(BaseModel):
    name: str
    total: float
    spent: float
    pct: float
    icon: str
    iconClass: str
    color: str

class Alert(BaseModel):
    type: str
    icon: str
    message: str
    date: str

class Transaction(BaseModel):
    name: str
    category: str
    amount: str
    date: str
    income: bool

class Bill(BaseModel):
    name: str
    due: str
    amount: str
    icon: str
    iconClass: str
    autoPay: bool

class Account(BaseModel):
    label: str
    number: str
    balance: str
    icon: str
    iconClass: str
    negative: bool

class CashFlowEntry(BaseModel):
    month: str
    Income: float
    Expenses: float

class SpendingEntry(BaseModel):
    name: str
    value: float
    color: str

class SummaryCard(BaseModel):
    label: str
    value: str
    delta: str
    up: bool
    icon: str
    iconClass: str

class Currency(BaseModel):
    code: str
    amount: str
    rate: str
    converted: str
    change: str
    changeClass: str
    arrow: str

@app.get("/")
async def root():
    return {"message": "Welcome to Banking API"}

# Budgets
@app.get("/api/budgets", response_model=List[Budget])
async def get_budgets():
    data = load_data()
    return data["budgets"]

@app.post("/api/budgets", response_model=Budget)
async def add_budget(budget: Budget):
    data = load_data()
    data["budgets"].append(budget.dict())
    save_data(data)
    return budget

@app.delete("/api/budgets/{name}")
async def delete_budget(name: str):
    data = load_data()
    data["budgets"] = [b for b in data["budgets"] if b["name"] != name]
    save_data(data)
    return {"status": "success"}

# Alerts
@app.get("/api/alerts", response_model=List[Alert])
async def get_alerts():
    data = load_data()
    return data["alerts"]

@app.post("/api/alerts", response_model=Alert)
async def add_alert(alert: Alert):
    data = load_data()
    data["alerts"].append(alert.dict())
    save_data(data)
    return alert

@app.delete("/api/alerts")
async def delete_alert(message: str):
    data = load_data()
    data["alerts"] = [a for a in data["alerts"] if a["message"] != message]
    save_data(data)
    return {"status": "success"}

# Transactions
@app.get("/api/transactions", response_model=List[Transaction])
async def get_transactions():
    data = load_data()
    return data["transactions"]

@app.post("/api/transactions", response_model=Transaction)
async def add_transaction(tx: Transaction):
    data = load_data()
    data["transactions"].append(tx.dict())
    save_data(data)
    return tx

@app.delete("/api/transactions")
async def delete_transaction(name: str, date: str):
    data = load_data()
    data["transactions"] = [t for t in data["transactions"] if not (t["name"] == name and t["date"] == date)]
    save_data(data)
    return {"status": "success"}

# Bills
@app.get("/api/bills", response_model=List[Bill])
async def get_bills():
    data = load_data()
    return data["bills"]

@app.post("/api/bills", response_model=Bill)
async def add_bill(bill: Bill):
    data = load_data()
    data["bills"].append(bill.dict())
    save_data(data)
    return bill

@app.delete("/api/bills/{name}")
async def delete_bill(name: str):
    data = load_data()
    data["bills"] = [b for b in data["bills"] if b["name"] != name]
    save_data(data)
    return {"status": "success"}

# Accounts
@app.get("/api/accounts", response_model=List[Account])
async def get_accounts():
    data = load_data()
    return data["accounts"]

@app.post("/api/accounts", response_model=Account)
async def add_account(acc: Account):
    data = load_data()
    data["accounts"].append(acc.dict())
    save_data(data)
    return acc

@app.delete("/api/accounts/{label}")
async def delete_account(label: str):
    data = load_data()
    data["accounts"] = [a for a in data["accounts"] if a["label"] != label]
    save_data(data)
    return {"status": "success"}

# Cash Flow
@app.get("/api/cash-flow", response_model=List[CashFlowEntry])
async def get_cash_flow():
    data = load_data()
    return data["cashFlow"]

@app.post("/api/cash-flow", response_model=CashFlowEntry)
async def add_cash_flow(entry: CashFlowEntry):
    data = load_data()
    data["cashFlow"].append(entry.dict())
    save_data(data)
    return entry

@app.delete("/api/cash-flow/{month}")
async def delete_cash_flow(month: str):
    data = load_data()
    data["cashFlow"] = [c for c in data["cashFlow"] if c["month"] != month]
    save_data(data)
    return {"status": "success"}

# Spending
@app.get("/api/spending", response_model=List[SpendingEntry])
async def get_spending():
    data = load_data()
    return data["spending"]

@app.post("/api/spending", response_model=SpendingEntry)
async def add_spending(entry: SpendingEntry):
    data = load_data()
    data["spending"].append(entry.dict())
    save_data(data)
    return entry

@app.delete("/api/spending/{name}")
async def delete_spending(name: str):
    data = load_data()
    data["spending"] = [s for s in data["spending"] if s["name"] != name]
    save_data(data)
    return {"status": "success"}

# Summary Cards
@app.get("/api/summary-cards", response_model=List[SummaryCard])
async def get_summary_cards():
    data = load_data()
    return data["summaryCards"]

# Multi-Currency Summary
@app.get("/api/currencies", response_model=List[Currency])
async def get_currencies():
    data = load_data()
    return data.get("currencies", [])

@app.post("/api/currencies", response_model=Currency)
async def add_currency(curr: Currency):
    data = load_data()
    if "currencies" not in data:
        data["currencies"] = []
    data["currencies"].append(curr.dict())
    save_data(data)
    return curr

@app.delete("/api/currencies/{code}")
async def delete_currency(code: str):
    data = load_data()
    data["currencies"] = [c for c in data["currencies"] if c["code"] != code]
    save_data(data)
    return {"status": "success"}

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
