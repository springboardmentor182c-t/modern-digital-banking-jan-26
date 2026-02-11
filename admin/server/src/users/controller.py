from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database.core import DB_AVAILABLE, SessionLocal

# Mock data for demo when database is unavailable
MOCK_USERS = [
    {"id": 1, "name": "John Doe", "email": "john@example.com", "status": "active", "kyc_status": "verified", "joined_date": "2024-01-15"},
    {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "status": "active", "kyc_status": "verified", "joined_date": "2024-02-20"},
    {"id": 3, "name": "Bob Wilson", "email": "bob@example.com", "status": "suspended", "kyc_status": "pending", "joined_date": "2024-03-10"},
    {"id": 4, "name": "Alice Brown", "email": "alice@example.com", "status": "active", "kyc_status": "verified", "joined_date": "2024-04-05"},
    {"id": 5, "name": "Charlie Davis", "email": "charlie@example.com", "status": "inactive", "kyc_status": "unverified", "joined_date": "2024-05-18"},
]

# Pydantic schemas for users
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str
    kyc_status: str
    account_count: Optional[int] = 0
    joined_date: Optional[str] = None
    last_active: Optional[str] = None

class UserStatusUpdate(BaseModel):
    status: str

class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int

class UserStatsResponse(BaseModel):
    total: int
    active: int
    suspended: int
    inactive: int
    verified_kyc: int
    pending_kyc: int

router = APIRouter(prefix="/admin/users", tags=["Users"])

@router.get("/", response_model=UsersListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = None
):
    """
    Get paginated list of users with optional status filter
    """
    # Use mock data if database is unavailable
    if not DB_AVAILABLE:
        users = MOCK_USERS.copy()
        
        # Apply status filter
        if status_filter and status_filter != "all":
            users = [u for u in users if u["status"] == status_filter]
        
        total = len(users)
        skip = (page - 1) * page_size
        users = users[skip:skip + page_size]
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    # Use database
    db = SessionLocal()
    try:
        from .service import get_users
        
        skip = (page - 1) * page_size
        users = get_users(db, skip=skip, limit=page_size)
        
        # Format users for response
        user_responses = []
        for user in users:
            user_responses.append({
                "id": user.id,
                "name": user.name or "Unknown",
                "email": user.email,
                "status": user.status or "active",
                "kyc_status": user.kyc_status or "unverified",
                "account_count": 0,
                "joined_date": user.created_at.strftime("%Y-%m-%d") if user.created_at else None,
                "last_active": None
            })
        
        total = db.query(User).count()
        
        return {
            "users": user_responses,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    finally:
        db.close()

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats():
    """
    Get user statistics
    """
    # Use mock stats if database is unavailable
    if not DB_AVAILABLE:
        return {
            "total": len(MOCK_USERS),
            "active": 3,
            "suspended": 1,
            "inactive": 1,
            "verified_kyc": 3,
            "pending_kyc": 1
        }
    
    db = SessionLocal()
    try:
        from .service import get_user_stats as get_stats
        return get_stats(db)
    finally:
        db.close()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """
    Get user by ID
    """
    if not DB_AVAILABLE:
        # Find user in mock data
        user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    db = SessionLocal()
    try:
        from .service import get_user_by_id
        
        user = get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user.id,
            "name": user.name or "Unknown",
            "email": user.email,
            "status": user.status or "active",
            "kyc_status": user.kyc_status or "unverified",
            "account_count": 0,
            "joined_date": user.created_at.strftime("%Y-%m-%d") if user.created_at else None,
            "last_active": None
        }
    finally:
        db.close()

@router.patch("/{user_id}/status")
async def update_user_status(user_id: int, status_update: UserStatusUpdate):
    """
    Update user status (active, suspended, inactive)
    """
    valid_statuses = ["active", "suspended", "inactive"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    if not DB_AVAILABLE:
        # Update mock data
        user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User status updated successfully", "user_id": user_id, "status": status_update.status}
    
    db = SessionLocal()
    try:
        from .service import update_user_status as update_status
        
        user = update_status(db, user_id, status_update.status)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User status updated successfully", "user_id": user_id, "status": status_update.status}
    finally:
        db.close()

# Import User model for queries
from .models import User

