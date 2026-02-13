from sqlalchemy import Column, Integer, Boolean, String
from ..database.core import Base

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    maintenance_mode = Column(Boolean, default=False)
    low_balance_threshold = Column(Integer, default=1000)
    bill_due_reminder_days = Column(Integer, default=3)
    budget_warning_percentage = Column(Integer, default=90)
    alert_frequency_hours = Column(Integer, default=24)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=False)
    admin_digest = Column(Boolean, default=True)
    two_factor_auth = Column(Boolean, default=True)
    session_timeout = Column(Integer, default=30)
    ip_whitelisting = Column(Boolean, default=False)
    max_login_attempts = Column(Integer, default=3)
    data_retention_days = Column(Integer, default=2555)
    log_retention_days = Column(Integer, default=365)
    auto_backup = Column(Boolean, default=True)
    debug_mode = Column(Boolean, default=False)

