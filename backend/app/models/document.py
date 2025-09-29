from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"
    
    document_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, nullable=False)
    visit_id = Column(Integer)
    document_type = Column(String(50))  # 'Lab Report', 'X-Ray', 'MRI', 'Prescription', 'Other'
    file_name = Column(String(255))
    file_path = Column(String(500))
    upload_date = Column(DateTime, server_default=func.now())