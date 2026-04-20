from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.transactions.models import Transaction, TransactionType
from src.accounts.models import Account
from src.analytics.schemas import PredictCashFlowResponse, DailyForecast

async def predict_cash_flow(user_id: int, db: AsyncSession) -> PredictCashFlowResponse:
    # 1. Get user accounts
    accounts_query = await db.execute(select(Account).filter(Account.user_id == user_id))
    accounts = accounts_query.scalars().all()
    
    if not accounts:
        return PredictCashFlowResponse(predicted_balance=[], daily_forecast=[])
    
    account_ids = [acc.id for acc in accounts]
    
    # Check if we should compute balance from transactions
    current_balance = sum((acc.balance or 0.0) for acc in accounts)
    
    if current_balance == 0.0:
        # Fallback to computing from transactions
        all_txns_query = await db.execute(
            select(Transaction).filter(Transaction.account_id.in_(account_ids))
        )
        all_txns = all_txns_query.scalars().all()
        
        all_income = sum(float(t.amount or 0.0) for t in all_txns if t.txn_type == TransactionType.credit)
        all_expense = sum(float(t.amount or 0.0) for t in all_txns if t.txn_type == TransactionType.debit)
        current_balance = all_income - all_expense

    # 2. Get past transactions (last 30 days) for finding averages
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    txns_query = await db.execute(
        select(Transaction)
        .filter(Transaction.account_id.in_(account_ids))
        .filter(Transaction.txn_date >= thirty_days_ago)
    )
    transactions = txns_query.scalars().all()
    
    total_income = 0.0
    total_expense = 0.0
    days_to_average = 30
    
    for txn in transactions:
        amount = float(txn.amount or 0.0)
        if txn.txn_type == TransactionType.credit:
            total_income += amount
        elif txn.txn_type == TransactionType.debit:
            total_expense += amount
            
    avg_daily_income = total_income / days_to_average
    avg_daily_expense = total_expense / days_to_average
    
    predicted_balances = []
    daily_forecasts = []
    
    running_balance = current_balance
    
    for i in range(1, 8):
        forecast_date = datetime.now(timezone.utc) + timedelta(days=i)
        date_str = forecast_date.strftime("%Y-%m-%d")
        
        running_balance += (avg_daily_income - avg_daily_expense)
        predicted_balances.append(round(running_balance, 2))
        
        daily_forecasts.append(
            DailyForecast(
                date=date_str,
                income=round(avg_daily_income, 2),
                expense=round(avg_daily_expense, 2)
            )
        )
        
    return PredictCashFlowResponse(
        predicted_balance=predicted_balances,
        daily_forecast=daily_forecasts
    )
