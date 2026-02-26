from src.database.core import SessionLocal
from src.models.user import User, Account
from src.alerts.models import Alert
from sqlalchemy import func

db = SessionLocal()

try:
    # Test user count
    total_users = db.query(User).count()
    print(f"Total users: {total_users}")
    
    # Test active users
    active_users = db.query(User).filter(User.is_verified == True).count()
    print(f"Active users: {active_users}")
    
    # Test accounts
    linked_accounts = db.query(Account).filter(Account.status == "Active").count()
    print(f"Linked accounts: {linked_accounts}")
    
    # Test alerts
    alerts_triggered = db.query(Alert).count()
    print(f"Alerts: {alerts_triggered}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
