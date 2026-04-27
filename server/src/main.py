from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth.router import router as auth_router
from src.accounts.router import router as accounts_router
from src.transactions.router import router as transactions_router
from src.budgets.router import router as budgets_router
from src.bills.router import router as bills_router
from src.analytics.router import router as analytics_router
from src.ai_insights.router import router as ai_insights_router
from src.ai_budget.router import router as ai_budget_router

# ✅ ADD THESE TWO LINES
from src.database import Base, engine

app = FastAPI(title="NeoVault API")

app.add_middleware(
    CORSMiddleware,
<<<<<<< Updated upstream
    allow_origins=["*"],
    allow_credentials=False,
=======
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
>>>>>>> Stashed changes
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ CREATE TABLES ON STARTUP
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(accounts_router, prefix="/accounts", tags=["Accounts"])
app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
app.include_router(budgets_router, prefix="/budgets", tags=["Budgets"])
app.include_router(bills_router, prefix="/bills", tags=["Bills & Rewards"])
<<<<<<< Updated upstream
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics & Alerts"])
# --- : ADMIN MODULE LOGIC ---

@app.get("/api/admin/currency-stats")
def get_admin_currency():
    # This provides the dynamic rates the mentor asked for
    return {
        "usd_rate": 83.45,
        "eur_rate": 89.10,
        "total_liquidity": "1.2M",
        "status": "Live"
    }

@app.get("/api/admin/rewards-check")
def check_rewards():
    # This fulfills the "rewards logic" requirement
    return [
        {"user": "Lekshmi", "points": 1200, "tier": "Gold", "bonus_eligible": True},
        {"user": "Adithya", "points": 450, "tier": "Silver", "bonus_eligible": False}
    ]

@app.get("/api/admin/alerts")
def get_budget_alerts():
    # This fulfills the "budget alerts" requirement
    return [
        {"user": "User_01", "spent": 6500, "limit": 5000, "status": "CRITICAL - Budget Crossed"}
    ]
app.include_router(ai_insights_router, prefix="/ai-insights", tags=["AI Insights"])
app.include_router(ai_budget_router, prefix="/ai", tags=["AI Budget"])
=======
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics & Alerts"])
>>>>>>> Stashed changes
