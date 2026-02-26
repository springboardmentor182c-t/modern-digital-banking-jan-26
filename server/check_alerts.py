from src.database.core import engine
from sqlalchemy import text, inspect

# Check alerts table columns
inspector = inspect(engine)
columns = inspector.get_columns('alerts')
print("Alerts columns:", [c['name'] for c in columns])

# Add missing columns
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)"))
        conn.commit()
        print("user_name column added")
    except Exception as e:
        print(f"Error adding user_name: {e}")
