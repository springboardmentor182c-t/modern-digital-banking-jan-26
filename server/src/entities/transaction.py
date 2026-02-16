from sqlalchemy import Column, Integer, String, Numeric, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from src.database.core import Base
import enum

class TransactionType(str, enum.Enum):
    debit = "debit"
    credit = "credit"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    category = Column(String)
    amount = Column(Numeric)
    txn_type = Column(Enum(TransactionType))
    created_at = Column(TIMESTAMP, server_default=func.now())
