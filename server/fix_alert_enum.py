from src.database.core import engine
from sqlalchemy import text, inspect

# Check alerts table columns and types
inspector = inspect(engine)
columns = inspector.get_columns('alerts')
print("Alerts columns:")
for col in columns:
    print(f"  {col['name']}: {col['type']}")

# Check if type is an enum
with engine.connect() as conn:
    # Check current enum values
    result = conn.execute(text("""
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'alerttype')
    """))
    print("\nCurrent enum values:")
    for row in result:
        print(f"  {row[0]}")
    
    # Convert enum to VARCHAR
    try:
        # First, check if there are any rows with invalid enum values
        conn.execute(text("ALTER TABLE alerts ALTER COLUMN type TYPE VARCHAR(100)"))
        conn.commit()
        print("\nConverted type column to VARCHAR")
    except Exception as e:
        print(f"\nError converting: {e}")
