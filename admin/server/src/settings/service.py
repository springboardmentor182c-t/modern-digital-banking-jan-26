from sqlalchemy.orm import Session
from .models import Settings

def get_settings(db):
    return db.query(Settings).first()
