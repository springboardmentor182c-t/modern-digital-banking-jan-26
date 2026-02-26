from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = "postgresql://postgres:root@localhost:5432/digital_banking_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Check if database is available at import time
DB_AVAILABLE = False
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    DB_AVAILABLE = True
    logger.info("Database connection successful")
except Exception as e:
    logger.warning(f"Database connection failed: {e}")
    DB_AVAILABLE = False


def is_database_available() -> bool:
    """
    Dynamically check if database is available.
    This function can be called to verify database connectivity at runtime.
    """
    global DB_AVAILABLE
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        DB_AVAILABLE = True
        return True
    except Exception as e:
        logger.warning(f"Database connection check failed: {e}")
        DB_AVAILABLE = False
        return False
