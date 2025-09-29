from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.visit import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse

router = APIRouter()

@router.get("/visits/{visit_id}/prescriptions", response_model=List[PrescriptionResponse])
async def get_visit_prescriptions(visit_id: int, db: Session = Depends(get_db)):
    prescriptions = db.query(Prescription).filter(Prescription.visit_id == visit_id).all()
    return prescriptions

@router.post("/visits/{visit_id}/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(visit_id: int, prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    prescription_data = prescription.dict()
    prescription_data["visit_id"] = visit_id
    db_prescription = Prescription(**prescription_data)
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

@router.put("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionCreate,
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.prescription_id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    for field, value in prescription_update.dict(exclude_unset=True).items():
        setattr(prescription, field, value)
    
    db.commit()
    db.refresh(prescription)
    return prescription