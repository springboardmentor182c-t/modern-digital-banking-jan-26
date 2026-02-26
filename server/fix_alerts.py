from src.database.core import engine
from sqlalchemy import text, inspect

# Check alerts table columns
inspector = inspect(engine)
columns = inspector.get_columns('alerts')
column_names = [c['name'] for c in columns]
print("Alerts columns:", column_names)

# Add missing columns
with engine.connect() as conn:
    try:
        if 'severity' not in column_names:
            conn.execute(text("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'low'"))
            conn.commit()
            print("severity column added")
        if 'status' not in column_names:
            conn.execute(text("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'unread'"))
            conn.commit()
            print("status column added")
    except Exception as e:
        print(f"Error: {e}")
