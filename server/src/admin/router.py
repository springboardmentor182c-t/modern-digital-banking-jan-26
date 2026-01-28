from fastapi import APIRouter
from server.src.admin.mock_data import (
    DASHBOARD_SUMMARY,
    USER_GROWTH,
    REVENUE_TRENDS,
    TRANSACTION_ACTIVITY,
    RECENT_USERS,
    SERVER_STATUS,
    RECENT_ACTIVITY
)

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)


@router.get("/summary")
def dashboard_summary():
    return {
        "success": True,
        "data": DASHBOARD_SUMMARY
    }



@router.get("/user-growth")
def user_growth():
    return {
        "success": True,
        "data": {
            "labels": [item["date"] for item in USER_GROWTH],
            "values": [item["users"] for item in USER_GROWTH]
        }
    }


@router.get("/revenue")
def revenue_trends():
    return {
        "success": True,
        "data": {
            "labels": [item["date"] for item in REVENUE_TRENDS],
            "values": [item["revenue"] for item in REVENUE_TRENDS]
        }
    }


@router.get("/transactions")
def transactions():
    return {
        "success": True,
        "data": {
            "labels": [item["date"] for item in TRANSACTION_ACTIVITY],
            "values": [item["transactions"] for item in TRANSACTION_ACTIVITY]
        }
    }



@router.get("/users")
def recent_users():
    return {
        "success": True,
        "data": {
            "total": 1489,
            "items": RECENT_USERS
        }
    }




@router.get("/status")
def server_status():
    return {
        "success": True,
        "data": SERVER_STATUS
    }


@router.get("/activity")
def recent_activity():
    return {
        "success": True,
        "data": {
            "items": RECENT_ACTIVITY
        }
    }

