"""
Users admin router — list, stats, status update, CSV export.
Falls back to mock data when DB is unavailable.
"""

import csv
import io
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..database.core import DB_AVAILABLE, SessionLocal

# ---------------------------------------------------------------------------
# Mock data fallback
# ---------------------------------------------------------------------------
MOCK_USERS = [
    {"id": 1, "name": "Alice Johnson",  "email": "alice@example.com",  "status": "active",    "kyc_status": "verified", "account_count": 3, "joined_date": "2025-03-12", "last_active": "2026-03-01"},
    {"id": 2, "name": "Bob Martinez",   "email": "bob@example.com",    "status": "active",    "kyc_status": "pending",  "account_count": 1, "joined_date": "2025-06-05", "last_active": "2026-02-28"},
    {"id": 3, "name": "Carol Smith",    "email": "carol@example.com",  "status": "suspended", "kyc_status": "verified", "account_count": 4, "joined_date": "2025-01-20", "last_active": "2026-01-15"},
    {"id": 4, "name": "David Lee",      "email": "david@example.com",  "status": "inactive",  "kyc_status": "rejected", "account_count": 2, "joined_date": "2025-08-30", "last_active": "2025-12-10"},
    {"id": 5, "name": "Eva Williams",   "email": "eva@example.com",    "status": "active",    "kyc_status": "verified", "account_count": 2, "joined_date": "2025-04-17", "last_active": "2026-03-01"},
    {"id": 6, "name": "Frank Nguyen",   "email": "frank@example.com",  "status": "active",    "kyc_status": "pending",  "account_count": 1, "joined_date": "2026-01-02", "last_active": "2026-02-27"},
    {"id": 7, "name": "Grace Chen",     "email": "grace@example.com",  "status": "active",    "kyc_status": "verified", "account_count": 3, "joined_date": "2025-11-11", "last_active": "2026-03-01"},
    {"id": 8, "name": "Henry Patel",    "email": "henry@example.com",  "status": "suspended", "kyc_status": "verified", "account_count": 2, "joined_date": "2025-07-22", "last_active": "2026-02-01"},
]

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/admin/users", tags=["Users"])


def _user_name(user) -> str:
    """Build display name from user model (supports both name and first_name/last_name)."""
    if getattr(user, "name", None):
        return user.name
    parts = [getattr(user, "first_name", ""), getattr(user, "last_name", "")]
    name = " ".join(p for p in parts if p)
    return name or user.email or "Unknown"


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats():
    """Get user statistics."""
    if not DB_AVAILABLE:
        active = sum(1 for u in MOCK_USERS if u["status"] == "active")
        susp   = sum(1 for u in MOCK_USERS if u["status"] == "suspended")
        inact  = sum(1 for u in MOCK_USERS if u["status"] == "inactive")
        verif  = sum(1 for u in MOCK_USERS if u["kyc_status"] == "verified")
        pend   = sum(1 for u in MOCK_USERS if u["kyc_status"] == "pending")
        return {"total": len(MOCK_USERS), "active": active, "suspended": susp,
                "inactive": inact, "verified_kyc": verif, "pending_kyc": pend}

    db = SessionLocal()
    try:
        from .service import get_user_stats as get_stats
        return get_stats(db)
    finally:
        db.close()


@router.get("/export/csv")
async def export_users_csv():
    """Export all users as a downloadable CSV file."""
    if not DB_AVAILABLE:
        rows = MOCK_USERS
    else:
        db = SessionLocal()
        try:
            from ..models.user import User as AuthUser
            users = db.query(AuthUser).all()
            rows = [
                {
                    "id": u.id,
                    "name": _user_name(u),
                    "email": u.email,
                    "status": getattr(u, "status", "active") or "active",
                    "kyc_status": getattr(u, "kyc_status", "unverified") or "unverified",
                    "account_count": 0,
                    "joined_date": u.created_at.strftime("%Y-%m-%d") if getattr(u, "created_at", None) else "",
                    "last_active": "",
                }
                for u in users
            ]
        finally:
            db.close()

    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "name", "email", "status", "kyc_status",
                    "account_count", "joined_date", "last_active"],
        extrasaction="ignore",
    )
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"},
    )


@router.get("/", response_model=UsersListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = None,
):
    """Get paginated list of users."""
    if not DB_AVAILABLE:
        users = MOCK_USERS.copy()
        if status_filter and status_filter != "all":
            users = [u for u in users if u["status"] == status_filter]
        total = len(users)
        skip = (page - 1) * page_size
        return {"users": users[skip:skip + page_size], "total": total,
                "page": page, "page_size": page_size}

    db = SessionLocal()
    try:
        from ..models.user import User as AuthUser
        query = db.query(AuthUser)
        if status_filter and status_filter != "all":
            query = query.filter(AuthUser.status == status_filter)
        total = query.count()
        users_db = query.offset((page - 1) * page_size).limit(page_size).all()
        user_responses = [
            {
                "id": u.id,
                "name": _user_name(u),
                "email": u.email,
                "status": getattr(u, "status", "active") or "active",
                "kyc_status": getattr(u, "kyc_status", "unverified") or "unverified",
                "account_count": 0,
                "joined_date": u.created_at.strftime("%Y-%m-%d") if getattr(u, "created_at", None) else None,
                "last_active": None,
            }
            for u in users_db
        ]
        return {"users": user_responses, "total": total, "page": page, "page_size": page_size}
    finally:
        db.close()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get user by ID."""
    if not DB_AVAILABLE:
        user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    db = SessionLocal()
    try:
        from ..models.user import User as AuthUser
        user = db.query(AuthUser).filter(AuthUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id, "name": _user_name(user), "email": user.email,
            "status": getattr(user, "status", "active") or "active",
            "kyc_status": getattr(user, "kyc_status", "unverified") or "unverified",
            "account_count": 0,
            "joined_date": user.created_at.strftime("%Y-%m-%d") if getattr(user, "created_at", None) else None,
            "last_active": None,
        }
    finally:
        db.close()


@router.patch("/{user_id}/status")
async def update_user_status(user_id: int, status_update: UserStatusUpdate):
    """Update user account status."""
    valid_statuses = ["active", "suspended", "inactive"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400,
                            detail=f"Invalid status. Must be: {', '.join(valid_statuses)}")

    if not DB_AVAILABLE:
        user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user["status"] = status_update.status
        return {"message": "User status updated successfully", "user_id": user_id,
                "status": status_update.status}

    db = SessionLocal()
    try:
        from ..models.user import User as AuthUser
        user = db.query(AuthUser).filter(AuthUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.status = status_update.status
        db.commit()
        # Log action
        try:
            from ..logs.models import AdminLog
            log = AdminLog(action=f"USER_{status_update.status.upper()}",
                           target_type="user", target_id=user_id,
                           target_name=_user_name(user),
                           details=f"Status changed to {status_update.status}")
            db.add(log)
            db.commit()
        except Exception:
            pass
        return {"message": "User status updated successfully", "user_id": user_id,
                "status": status_update.status}
    finally:
        db.close()
