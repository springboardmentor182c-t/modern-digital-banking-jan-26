from src.database.core import engine
from src.models.user import Budget
Budget.__table__.drop(engine, checkfirst=True)
Budget.__table__.create(engine)
print("Recreated budgets table")
