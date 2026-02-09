from sqlalchemy.orm import Session
from users.models import User
from alerts.models import Alert

def stats(db: Session):
    return {
        "total_users": db.query(User).count(),
        "alerts": db.query(Alert).count()
    }
