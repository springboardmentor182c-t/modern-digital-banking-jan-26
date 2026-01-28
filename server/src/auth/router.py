from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from server.src.auth.dependencies import create_access_token

router = APIRouter()


# =========================
# Request Schema
# =========================
class AdminLoginRequest(BaseModel):
    email: str
    password: str


# =========================
# Admin Login Endpoint
# =========================
@router.post("/admin/login")
def admin_login(data: AdminLoginRequest):
    # TEMP MOCK CREDENTIALS (later DB)
    if data.email == "admin@vaultbank.com" and data.password == "admin123":

        access_token = create_access_token(
            data={
                "sub": data.email,
                "role": "admin"
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid admin credentials"
    )
