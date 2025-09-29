from sqlalchemy import Column, Integer, String, Text, Date, DateTime
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
    frequency = Column(String(50))
    duration = Column(String(50))
    instructions = Column(Text)