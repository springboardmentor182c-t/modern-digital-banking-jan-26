from sqlalchemy.orm import Session
import random, hashlib
from datetime import datetime, timedelta
import os
import jwt

# Import database from new location
from src.database.core import SessionLocal

# JWT / Auth helper config
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Try to use bcrypt, fallback to SHA256
try:
    from passlib.context import CryptContext
    bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    BCRYPT_AVAILABLE = True
except Exception:
    BCRYPT_AVAILABLE = False


def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Utility Functions
def hash_password(password: str) -> str:
    """Hash password using SHA256 (consistent with existing code)"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))


def hash_password_bcrypt(password: str) -> str:
    """Hash password using SHA256 (consistent with existing code)"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password_bcrypt(plain_password: str, hashed_password: str) -> bool:
    """Verify SHA256 hashed password"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


# JWT helpers
def create_access_token(subject: str, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = {"sub": str(subject)}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


from fastapi import Header, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.models.user import User

security = HTTPBearer()


async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db), x_user_id: str = Header(None)):
    """Decode bearer token and return the authenticated user (raises 401 on errors).

    Fallback: if no bearer token provided (or invalid), accept `X-User-Id` header as a convenience
    for cases where frontend has not yet stored JWT. This keeps backward compatibility.
    """
    user_id = None

    # Try bearer token first
    if credentials and credentials.credentials:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
        except Exception:
            # ignore token decode errors and fallback to X-User-Id
            user_id = None

    # Fallback to X-User-Id header (string expected to be integer user id)
    if not user_id and x_user_id:
        try:
            user_id = int(x_user_id)
        except Exception:
            raise HTTPException(401, "Invalid X-User-Id header")

    if not user_id:
        raise HTTPException(401, "Authentication required")

    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user
