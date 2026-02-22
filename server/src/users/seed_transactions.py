from src.database import SessionLocal
from src.models import Transaction
from datetime import date, timedelta

sample = [
    {"merchant": "Coffee House", "category": "Food & Dining", "type": "debit", "amount": 4.50, "status": "completed"},
    {"merchant": "Grocery Store", "category": "Groceries", "type": "debit", "amount": 62.30, "status": "completed"},
    {"merchant": "Salary", "category": "Income", "type": "credit", "amount": 2500.00, "status": "completed"},
    {"merchant": "Electricity Co.", "category": "Bills & Utilities", "type": "debit", "amount": 75.20, "status": "pending"},
    {"merchant": "Online Shop", "category": "Shopping", "type": "debit", "amount": 120.99, "status": "completed"},
    {"merchant": "Cinema", "category": "Entertainment", "type": "debit", "amount": 15.00, "status": "completed"},
    {"merchant": "Taxi Service", "category": "Transportation", "type": "debit", "amount": 8.40, "status": "completed"},
    {"merchant": "Freelance", "category": "Income", "type": "credit", "amount": 600.00, "status": "completed"},
    {"merchant": "Restaurant", "category": "Food & Dining", "type": "debit", "amount": 48.60, "status": "completed"},
    {"merchant": "Gym", "category": "Health", "type": "debit", "amount": 29.99, "status": "pending"},
]

if __name__ == '__main__':
    db = SessionLocal()
    try:
        # Get latest user id
        from models import User
        user = db.query(User).order_by(User.id.desc()).first()
        if not user:
            print('No users found in DB. Create a user first via /auth/register')
        else:
            uid = user.id
            today = date.today()
            created = 0
            for i, s in enumerate(sample):
                t = Transaction(
                    user_id=uid,
                    date=today - timedelta(days=i),
                    merchant=s['merchant'],
                    category=s.get('category'),
                    type=s['type'],
                    amount=s['amount'],
                    status=s['status']
                )
                db.add(t)
                created += 1
            db.commit()
            print(f'Inserted {created} transactions for user id {uid}')
    finally:
        db.close()
