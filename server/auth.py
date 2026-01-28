from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class AdminLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/admin/login")
def admin_login(data: AdminLoginRequest):
    if data.email == "admin@vaultbank.com" and data.password == "admin123":
        return {
            "message": "Login successful",
            "role": "admin"
        }
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials"
        )