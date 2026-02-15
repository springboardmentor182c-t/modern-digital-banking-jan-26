from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from src.database import get_db
from src.auth.router import get_current_user
from src.auth.models import User
from src.analytics.models import Alert
from src.analytics.schemas import AlertResponse

router = APIRouter()

@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Alert).filter(Alert.user_id == current_user.id).order_by(Alert.created_at.desc()))
    return result.scalars().all()

@router.patch("/alerts/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_as_read(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True
    await db.commit()
    await db.refresh(alert)
    return alert

# Admin Endpoints
@router.get("/admin/users")
async def get_admin_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Basic check for admin email
    if current_user.email != "admin@neovault.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(select(User))
    return result.scalars().all()

@router.patch("/admin/users/{user_id}/kyc")
async def update_user_kyc(
    user_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.email != "admin@neovault.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from src.auth.models import KYCStatus
    try:
        kyc_status = KYCStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid KYC status")
    
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.kyc_status = kyc_status
    await db.commit()
    await db.refresh(user)
    return {"status": "success", "user_id": user_id, "kyc_status": user.kyc_status}

@router.get("/admin/logs")
async def get_admin_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.email != "admin@neovault.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from src.analytics.models import AdminLog
    result = await db.execute(select(AdminLog).order_by(AdminLog.timestamp.desc()))
    return result.scalars().all()
