from src.database import SessionLocal
from src.models import User

if __name__ == '__main__':
    db = SessionLocal()
    try:
        user = db.query(User).order_by(User.id.desc()).first()
        if user:
            print(user.id)
        else:
            print('no-user')
    finally:
        db.close()
