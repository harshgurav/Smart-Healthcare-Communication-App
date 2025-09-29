from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"
    
    patient_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    age = Column(Integer)
    sex = Column(String(10))  # 'Male', 'Female', 'Other'
    height = Column(Float)  # in cm
    weight = Column(Float)  # in kg
    phone = Column(String(15))
    email = Column(String(100))
    address = Column(Text)
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(15))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class MedicalHistory(Base):
    __tablename__ = "medical_history"
    
    history_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, nullable=False)
    allergies = Column(Text)
    chronic_conditions = Column(Text)
    permanent_medications = Column(Text)
    family_history = Column(Text)
    lifestyle_notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())