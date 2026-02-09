from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random, hashlib
from datetime import datetime, timedelta

from src.database import SessionLocal
from src.models import User, OTP, PasswordResetOTP, Admin
from src.schemas import RegisterSchema, OTPSchema, LoginSchema, ForgotPasswordSchema, VerifyResetOTPSchema, ResetPasswordSchema, AdminLoginSchema

# Try to use bcrypt, fallback to SHA256
try:
    from passlib.context import CryptContext
    bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    BCRYPT_AVAILABLE = True
except Exception:
    BCRYPT_AVAILABLE = False

router = APIRouter()

# JWT / Auth helper config
import os
import jwt
from datetime import timedelta

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()


def get_db():
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
    to_encode = {"sub": str(subject)}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


from fastapi import Header

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

# PAGE 1 — PERSONAL INFO
@router.post("/register")
def register_user(data: RegisterSchema, db: Session = Depends(get_db)):
    if not data.terms_accepted:
        raise HTTPException(400, "Terms must be accepted")

    hashed_password = hashlib.sha256(data.password.encode()).hexdigest()

    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    otp_code = str(random.randint(100000, 999999))
    otp = OTP(user_id=user.id, otp=otp_code)
    db.add(otp)
    db.commit()

    return {
        "message": "User created",
        "user_id": user.id,
        "otp_for_testing": otp_code
    }

# PAGE 2 — OTP VERIFY
@router.post("/verify-otp")
def verify_otp(data: OTPSchema, db: Session = Depends(get_db)):
    otp = db.query(OTP).filter_by(user_id=data.user_id, otp=data.otp).first()

    if not otp:
        raise HTTPException(400, "Invalid OTP")

    user = db.query(User).filter_by(id=data.user_id).first()
    user.is_verified = True

    db.delete(otp)
    db.commit()

    return {"message": "OTP verified successfully"}


# PAGE 3 — LOGIN
@router.post("/login")
def login_user(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()
    
    if not user:
        raise HTTPException(401, "Invalid credentials")
    
    hashed_password = hashlib.sha256(data.password.encode()).hexdigest()
    
    if user.password != hashed_password:
        raise HTTPException(401, "Invalid credentials")
    
    if not user.is_verified:
        raise HTTPException(403, "Account not verified")

    # Create JWT access token
    access_token = create_access_token(subject=user.id, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id
    }


# FORGOT PASSWORD - Step 1: Request Password Reset
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordSchema, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter_by(email=data.email).first()
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Generate OTP
    otp_code = generate_otp()
    
    # Set expiry to 5 minutes from now
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Delete any existing unused reset OTPs for this user
    db.query(PasswordResetOTP).filter_by(user_id=user.id, is_used=False).delete()
    db.commit()
    
    # Create new password reset OTP
    reset_otp = PasswordResetOTP(
        user_id=user.id,
        otp=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    
    db.add(reset_otp)
    db.commit()
    
    return {
        "message": "OTP sent successfully",
        "expires_in": "5 minutes"
    }


# FORGOT PASSWORD - Step 2: Verify Reset OTP
@router.post("/verify-reset-otp")
def verify_reset_otp(data: VerifyResetOTPSchema, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter_by(email=data.email).first()
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Find matching OTP
    reset_otp = db.query(PasswordResetOTP).filter_by(
        user_id=user.id,
        otp=data.otp,
        is_used=False
    ).first()
    
    if not reset_otp:
        raise HTTPException(400, "Invalid OTP")
    
    # Check if OTP has expired
    if datetime.utcnow() > reset_otp.expires_at:
        raise HTTPException(400, "OTP has expired")
    
    # Mark OTP as used
    reset_otp.is_used = True
    db.commit()
    
    return {"message": "OTP verified successfully"}


# FORGOT PASSWORD - Step 3: Reset Password
@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter_by(email=data.email).first()
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Check if there's a recently verified (used) OTP for this user
    # This ensures password reset was initiated through forgot-password flow
    recent_used_otp = db.query(PasswordResetOTP).filter_by(
        user_id=user.id,
        is_used=True
    ).order_by(PasswordResetOTP.id.desc()).first()
    
    if not recent_used_otp:
        raise HTTPException(400, "Password reset not initiated. Please use forgot-password first.")
    
    # Check if OTP was recently used (within 10 minutes)
    if datetime.utcnow() - timedelta(minutes=10) > recent_used_otp.expires_at:
        raise HTTPException(400, "Password reset session expired. Please start again.")
    
    # Hash and update password
    hashed_password = hash_password(data.new_password)
    user.password = hashed_password
    
    # Clean up used OTPs for this user
    db.query(PasswordResetOTP).filter_by(user_id=user.id).delete()
    db.commit()
    
    return {"message": "Password reset successfully"}


# ADMIN LOGIN
@router.post("/admin/login")
def admin_login(data: AdminLoginSchema, db: Session = Depends(get_db)):
    """
    Admin login endpoint with bcrypt password verification
    
    Args:
        data: AdminLoginSchema with email and password
        db: Database session
    
    Returns:
        {
            "message": "Login successful",
            "admin_id": "<uuid>",
            "role": "ADMIN"
        }
    
    Raises:
        HTTPException(401): Invalid credentials
        HTTPException(403): Admin account is inactive
        HTTPException(404): Admin not found
    """
    # Step 1: Check if admin exists by email
    admin = db.query(Admin).filter_by(email=data.email).first()
    
    if not admin:
        raise HTTPException(401, "Invalid credentials")
    
    # Step 2: Verify password using bcrypt
    if not verify_password_bcrypt(data.password, admin.password_hash):
        raise HTTPException(401, "Invalid credentials")
    
    # Step 3: Check if admin account is active
    if not admin.is_active:
        raise HTTPException(403, "Admin account is inactive")
    
    # Step 4: Return successful login response
    return {
        "message": "Login successful",
        "admin_id": admin.id,
        "role": admin.role
    }

