from sqlalchemy import Column, Integer, String
from app.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False, index=True)
    strength = Column(String(60), nullable=True)
    form = Column(String(50), nullable=True)
