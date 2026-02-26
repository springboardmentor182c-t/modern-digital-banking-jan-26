from src.database.core import engine
from sqlalchemy import text, inspect

# Check if column exists
inspector = inspect(engine)
columns = inspector.get_columns('users')
column_names = [c['name'] for c in columns]
print("Current columns:", column_names)

if 'created_at' not in column_names:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
        conn.commit()
        print("Column added successfully")
else:
    print("Column already exists")
