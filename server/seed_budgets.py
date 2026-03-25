"""
Seed script: Injects budget data into the PostgreSQL database for all existing users.
Run: python seed_budgets.py   (from the server/ directory)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.database.core import SessionLocal, engine, Base
from src.models.user import Budget, User
from datetime import datetime

BUDGET_SEEDS = [
    {"category": "Food & Dining",      "limit": 5000,  "spent": 3200,  "icon": "food-&-dining"},
    {"category": "Shopping",           "limit": 4000,  "spent": 3800,  "icon": "shopping"},
    {"category": "Transportation",     "limit": 2500,  "spent": 800,   "icon": "transportation"},
    {"category": "Bills & Utilities",  "limit": 8000,  "spent": 8500,  "icon": "bills-&-utilities"},
    {"category": "Entertainment",      "limit": 3000,  "spent": 2900,  "icon": "entertainment"},
    {"category": "Healthcare",         "limit": 10000, "spent": 1500,  "icon": "healthcare"},
    {"category": "Travel",             "limit": 15000, "spent": 4200,  "icon": "travel"},
    {"category": "Groceries",          "limit": 6000,  "spent": 4500,  "icon": "groceries"},
    {"category": "Education",          "limit": 5000,  "spent": 1500,  "icon": "education"},
    {"category": "Personal Care",      "limit": 2000,  "spent": 1900,  "icon": "personal-care"},
]


def seed():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("⚠️  No users found in the database. Please register/login first, then rerun this script.")
            return

        for user in users:
            existing_count = db.query(Budget).filter_by(user_id=user.id).count()
            if existing_count >= len(BUDGET_SEEDS):
                print(f"✅ User {user.id} ({user.email}) already has {existing_count} budgets — skipping.")
                continue

            # Clear any partial data for this user first
            db.query(Budget).filter_by(user_id=user.id).delete()
            db.flush()

            added = 0
            for s in BUDGET_SEEDS:
                db.add(Budget(
                    user_id=user.id,
                    category=s["category"],
                    limit=s["limit"],
                    spent=s["spent"],
                    icon=s["icon"],
                ))
                added += 1

            db.commit()
            print(f"✅ Seeded {added} budgets for user {user.id} ({user.email})")

        print("\n🎉 Budget seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
