from src.database.core import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
    print("Tables:", [row[0] for row in result])
    
    # Check users table
    result = conn.execute(text("SELECT COUNT(*) FROM users"))
    print("User count:", result.scalar())
    
    # Check accounts table
    try:
        result = conn.execute(text("SELECT COUNT(*) FROM accounts"))
        print("Account count:", result.scalar())
    except Exception as e:
        print("Account error:", e)
    
    # Check alerts table
    try:
        result = conn.execute(text("SELECT COUNT(*) FROM alerts"))
        print("Alert count:", result.scalar())
    except Exception as e:
        print("Alert error:", e)
