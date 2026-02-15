from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from src.database import get_db
from src.auth.router import get_current_user
from src.auth.models import User
from src.bills.models import Bill, Reward
from src.bills.schemas import BillCreate, BillResponse, RewardResponse

router = APIRouter()

@router.post("/", response_model=BillResponse)
async def create_bill(
    bill: BillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_bill = Bill(**bill.dict(), user_id=current_user.id)
    db.add(new_bill)
    await db.commit()
    await db.refresh(new_bill)
    return new_bill

@router.get("/", response_model=List[BillResponse])
async def get_bills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Bill).filter(Bill.user_id == current_user.id))
    return result.scalars().all()

@router.get("/rewards", response_model=List[RewardResponse])
async def get_rewards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Reward).filter(Reward.user_id == current_user.id))
    return result.scalars().all()
