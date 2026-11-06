from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Visit(Base):
    __tablename__ = "visits"
    
    visit_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, nullable=False)
    visit_date = Column(Date)
    chief_complaint = Column(Text)
    symptoms = Column(Text)
    diagnosis = Column(Text)
    treatment_plan = Column(Text)
    follow_up_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    prescription_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    visit_id = Column(Integer, nullable=False)
    medicine_name = Column(String(100))
    dosage = Column(String(50))
    morning = Column(Boolean, default=False, nullable=False)
    noon = Column(Boolean, default=False, nullable=False)
    night = Column(Boolean, default=False, nullable=False)
    food_timing = Column(String(20), default="after")  # "before" | "after" | "with" | "any"
    duration_days = Column(Integer, nullable=True)
    frequency = Column(String(50))
    duration = Column(String(50))
    instructions = Column(Text)
