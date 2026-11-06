from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class ClinicSettings(Base):
    __tablename__ = "clinic_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_name = Column(String(100), nullable=False, default="Dr. Sarah Wilson")
    qualifications = Column(String(200), nullable=False, default="MBBS, MD (General Medicine)")
    registration_no = Column(String(100), nullable=False, default="MCI-45892 / DMC-28410")
    clinic_name = Column(String(150), nullable=False, default="Arogya Care Clinic & Diagnostic Centre")
    address = Column(Text, nullable=False, default="102, Ground Floor, Shanti Nagar Market, New Delhi - 110049")
    phone = Column(String(50), nullable=False, default="+91-9811223344, 011-26543210")
    timings = Column(String(200), nullable=False, default="Mon - Sat: 9:30 AM - 1:30 PM & 5:30 PM - 9:00 PM (Sun Closed)")
    services = Column(Text, nullable=False, default="General Consultation • Diabetes & Hypertension Management • ECG • Nebulization • Vaccination • Routine Lab Investigations")
    logo = Column(Text, nullable=True)
