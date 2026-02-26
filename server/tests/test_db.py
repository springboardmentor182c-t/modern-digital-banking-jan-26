from src.database.core import DB_AVAILABLE, engine
from sqlalchemy import text

print(f"DB_AVAILABLE: {DB_AVAILABLE}")

if DB_AVAILABLE:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT COUNT(*) FROM users'))
        print(f"User count: {result.scalar()}")
else:
    print("Database is not available!")
