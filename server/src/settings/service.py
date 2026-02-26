from sqlalchemy.orm import Session
from typing import Optional
from .models import Settings
from pydantic import BaseModel

def get_settings(db):
    """
    Get system settings (first row)
    """
    return db.query(Settings).first()

def update_settings(db, settings_data):
    """
    Update system settings
    """
    settings = db.query(Settings).first()
    
    if not settings:
        # Create default settings if none exist
        settings = Settings(maintenance_mode=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Update fields if provided
    update_data = settings_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(settings, field):
            setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

