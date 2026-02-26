from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = "postgresql://bank_user:bankpass123@localhost:5432/banking_admin"

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
