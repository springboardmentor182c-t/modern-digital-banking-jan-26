from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import os
from jose import JWTError, jwt
import bcrypt
from ..database.core import SessionLocal

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/auth/token")

# Pydantic Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: Optional[datetime] = None

# Database dependency
def get_db():
    try:
        db = SessionLocal()
        yield db
    except Exception:
        # Return None if database is not available
        yield None
    finally:
        if db is not None:
            db.close()

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Mock admin for demo (in production, use database)
# Password: admin123
ADMIN_HASH = "$2b$12$2mU4GMsCrJTQMVBIahJMu.xN08qizi5qjWR2FdlCdRoHbMjS05yRa"  # admin123

def authenticate_admin(email: str, password: str):
    # For demo, accept admin@smartbank.com with password admin123
    if email == "admin@smartbank.com" and verify_password(password, ADMIN_HASH):
        return {
            "id": 1,
            "email": "admin@smartbank.com",
            "name": "Admin User"
        }
    return None

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # For demo, return mock admin
    if email == "admin@smartbank.com":
        return {
            "id": 1,
            "email": email,
            "name": "Admin User"
        }
    raise credentials_exception

# Auth router
router = APIRouter(prefix="/admin/auth", tags=["Authentication"])

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    admin = authenticate_admin(form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=AdminResponse)
async def login(admin_login: AdminLogin):
    admin = authenticate_admin(admin_login.email, admin_login.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    return AdminResponse(**admin)

@router.get("/me", response_model=AdminResponse)
async def get_me(current_admin: dict = Depends(get_current_admin)):
    return current_admin

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}

