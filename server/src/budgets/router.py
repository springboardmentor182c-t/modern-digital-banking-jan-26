from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
from src.database import get_db
from src.auth.router import get_current_user
from src.auth.models import User
from src.budgets.models import Budget
from src.budgets.schemas import BudgetCreate, BudgetResponse
from src.transactions.models import Transaction
from src.accounts.models import Account

router = APIRouter()

@router.post("/", response_model=BudgetResponse)
async def create_budget(
    budget: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if budget already exists for this category/month/year
    result = await db.execute(
        select(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.category == budget.category,
            Budget.month == budget.month,
            Budget.year == budget.year
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Budget already exists for this category in this period")

    new_budget = Budget(**budget.dict(), user_id=current_user.id)
    db.add(new_budget)
    await db.commit()
    await db.refresh(new_budget)
    return new_budget

@router.get("/", response_model=List[BudgetResponse])
async def get_budgets(
    month: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.month == month,
            Budget.year == year
        )
    )
    budgets = result.scalars().all()
    
    # Calculate spent amount for each budget
    # In a real app, this might be better handled by a background job or a more complex query
    # to avoid N+1 issues or heavy calculation on read.
    # For now, we'll do a simple aggregation.
    
    updated_budgets = []
    for budget in budgets:
        # Sum transactions for this category, month, year
        # We need to join with Account to filter by user's accounts
        stmt = select(func.sum(Transaction.amount)).join(Account).filter(
            Account.user_id == current_user.id,
            Transaction.category == budget.category,
            func.extract('month', Transaction.txn_date) == month,
            func.extract('year', Transaction.txn_date) == year
        )
        spent = await db.execute(stmt)
        budget.spent_amount = spent.scalar() or 0.0
        updated_budgets.append(budget)

    return updated_budgets
