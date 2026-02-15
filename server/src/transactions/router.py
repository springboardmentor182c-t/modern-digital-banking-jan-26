from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from src.database import get_db
from src.auth.router import get_current_user
from src.auth.models import User
from src.transactions.models import Transaction, TransactionType
from src.transactions.schemas import TransactionCreate, TransactionResponse
from src.accounts.models import Account

router = APIRouter()

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    txn: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify account belongs to user
    result = await db.execute(
        select(Account).filter(Account.id == txn.account_id, Account.user_id == current_user.id)
    )
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    new_txn = Transaction(**txn.dict())
    
    # Update account balance
    if txn.txn_type == TransactionType.credit:
        account.balance += txn.amount
    else:
        account.balance -= txn.amount
        
    db.add(new_txn)
    await db.commit()
    await db.refresh(new_txn)
    return new_txn

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Join with accounts to filter by user
    result = await db.execute(
        select(Transaction)
        .join(Account)
        .filter(Account.user_id == current_user.id)
        .order_by(Transaction.txn_date.desc())
    )
    return result.scalars().all()
