from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def get_users():
    """Get all users"""
    return {"users": []}

@router.get("/{user_id}")
def get_user(user_id: int):
    """Get a specific user"""
    return {"id": user_id}

@router.put("/{user_id}")
def update_user(user_id: int, name: str, email: str):
    """Update user information"""
    return {"id": user_id, "updated": True}

@router.delete("/{user_id}")
def delete_user(user_id: int):
    """Delete a user"""
    return {"id": user_id, "deleted": True}
