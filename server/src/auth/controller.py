from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login(email: str, password: str):
    """Login endpoint"""
    return {"message": "Login endpoint"}

@router.post("/signup")
def signup(email: str, password: str, name: str):
    """Signup endpoint"""
    return {"message": "Signup endpoint"}

@router.post("/logout")
def logout():
    """Logout endpoint"""
    return {"message": "Logout endpoint"}
