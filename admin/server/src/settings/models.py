from sqlalchemy import Column, Integer, Boolean
from database.core import Base

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    maintenance_mode = Column(Boolean, default=False)
