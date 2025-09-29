from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.document import Document
import os
import shutil
from datetime import datetime

router = APIRouter()

@router.post("/patients/{patient_id}/documents")
async def upload_document(
    patient_id: int,
    file: UploadFile = File(...),
    document_type: str = "Other",
    visit_id: int = None,
    db: Session = Depends(get_db)
):
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{patient_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Save document record
    db_document = Document(
        patient_id=patient_id,
        visit_id=visit_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return {"message": "Document uploaded successfully", "document_id": db_document.document_id}

@router.get("/patients/{patient_id}/documents")
async def get_patient_documents(patient_id: int, db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.patient_id == patient_id).all()
    return documents