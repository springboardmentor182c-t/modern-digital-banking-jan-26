from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel
from ..database.core import DB_AVAILABLE, SessionLocal

# Mock settings data for demo when database is unavailable
MOCK_SETTINGS = {
    "id": 1,
    "maintenance_mode": False,
    "low_balance_threshold": 1000,
    "bill_due_reminder_days": 3,
    "budget_warning_percentage": 90,
    "alert_frequency_hours": 24,
    "email_notifications": True,
    "sms_notifications": True,
    "push_notifications": False,
    "admin_digest": True,
    "two_factor_auth": True,
    "session_timeout": 30,
    "ip_whitelisting": False,
    "max_login_attempts": 3,
    "data_retention_days": 2555,
    "log_retention_days": 365,
    "auto_backup": True,
    "debug_mode": False
}

# Pydantic schemas
class SettingsResponse(BaseModel):
    id: int
    maintenance_mode: bool
    low_balance_threshold: Optional[int] = 1000
    bill_due_reminder_days: Optional[int] = 3
    budget_warning_percentage: Optional[int] = 90
    alert_frequency_hours: Optional[int] = 24
    email_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = False
    admin_digest: Optional[bool] = True
    two_factor_auth: Optional[bool] = True
    session_timeout: Optional[int] = 30
    ip_whitelisting: Optional[bool] = False
    max_login_attempts: Optional[int] = 3
    data_retention_days: Optional[int] = 2555
    log_retention_days: Optional[int] = 365
    auto_backup: Optional[bool] = True
    debug_mode: Optional[bool] = False

class SettingsUpdate(BaseModel):
    maintenance_mode: Optional[bool] = None
    low_balance_threshold: Optional[int] = None
    bill_due_reminder_days: Optional[int] = None
    budget_warning_percentage: Optional[int] = None
    alert_frequency_hours: Optional[int] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    admin_digest: Optional[bool] = None
    two_factor_auth: Optional[bool] = None
    session_timeout: Optional[int] = None
    ip_whitelisting: Optional[bool] = None
    max_login_attempts: Optional[int] = None
    data_retention_days: Optional[int] = None
    log_retention_days: Optional[int] = None
    auto_backup: Optional[bool] = None
    debug_mode: Optional[bool] = None

router = APIRouter(prefix="/admin/settings", tags=["Settings"])

@router.get("/", response_model=SettingsResponse)
async def get_settings():
    """
    Get all system settings
    """
    # Return mock settings if database is unavailable
    if not DB_AVAILABLE:
        return MOCK_SETTINGS
    
    # Use database
    db = SessionLocal()
    try:
        from .service import get_settings as get_settings_service
        
        settings = get_settings_service(db)
        
        if not settings:
            return MOCK_SETTINGS
        
        return {
            "id": settings.id,
            "maintenance_mode": settings.maintenance_mode,
            "low_balance_threshold": getattr(settings, 'low_balance_threshold', 1000),
            "bill_due_reminder_days": getattr(settings, 'bill_due_reminder_days', 3),
            "budget_warning_percentage": getattr(settings, 'budget_warning_percentage', 90),
            "alert_frequency_hours": getattr(settings, 'alert_frequency_hours', 24),
            "email_notifications": getattr(settings, 'email_notifications', True),
            "sms_notifications": getattr(settings, 'sms_notifications', True),
            "push_notifications": getattr(settings, 'push_notifications', False),
            "admin_digest": getattr(settings, 'admin_digest', True),
            "two_factor_auth": getattr(settings, 'two_factor_auth', True),
            "session_timeout": getattr(settings, 'session_timeout', 30),
            "ip_whitelisting": getattr(settings, 'ip_whitelisting', False),
            "max_login_attempts": getattr(settings, 'max_login_attempts', 3),
            "data_retention_days": getattr(settings, 'data_retention_days', 2555),
            "log_retention_days": getattr(settings, 'log_retention_days', 365),
            "auto_backup": getattr(settings, 'auto_backup', True),
            "debug_mode": getattr(settings, 'debug_mode', False)
        }
    finally:
        db.close()

@router.put("/")
async def update_settings(settings_update: SettingsUpdate):
    """
    Update system settings
    """
    if not DB_AVAILABLE:
        # Simulate update in mock mode
        return {"message": "Settings updated successfully"}
    
    db = SessionLocal()
    try:
        from .service import update_settings as update_settings_service
        
        result = update_settings_service(db, settings_update)
        
        if not result:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        return {"message": "Settings updated successfully"}
    finally:
        db.close()

# Import model for queries
from .models import Settings

