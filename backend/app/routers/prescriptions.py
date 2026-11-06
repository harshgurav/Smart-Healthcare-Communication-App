from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
from app.database import get_db
from app.models.visit import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionBulkCreate, PrescriptionResponse

router = APIRouter()

def _prepare_prescription_dict(visit_id: int, prescription: PrescriptionCreate) -> dict:
    data = prescription.dict()
    data["visit_id"] = visit_id
    if not data.get("frequency") and (data.get("morning") or data.get("noon") or data.get("night")):
        m = 1 if data.get("morning") else 0
        n = 1 if data.get("noon") else 0
        nt = 1 if data.get("night") else 0
        data["frequency"] = f"{m}-{n}-{nt}"
    if not data.get("duration") and data.get("duration_days") is not None:
        days = data["duration_days"]
        data["duration"] = f"{days} day{'s' if days != 1 else ''}"
    return data

@router.get("/visits/{visit_id}/prescriptions", response_model=List[PrescriptionResponse])
async def get_visit_prescriptions(visit_id: int, db: Session = Depends(get_db)):
    prescriptions = db.query(Prescription).filter(Prescription.visit_id == visit_id).all()
    return prescriptions

@router.post("/visits/{visit_id}/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(visit_id: int, prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    prescription_data = _prepare_prescription_dict(visit_id, prescription)
    db_prescription = Prescription(**prescription_data)
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

@router.post("/visits/{visit_id}/prescriptions/bulk", response_model=List[PrescriptionResponse])
async def bulk_replace_prescriptions(
    visit_id: int,
    payload: Union[List[PrescriptionCreate], PrescriptionBulkCreate],
    db: Session = Depends(get_db)
):
    items = payload.prescriptions if isinstance(payload, PrescriptionBulkCreate) else payload
    try:
        db.query(Prescription).filter(Prescription.visit_id == visit_id).delete(synchronize_session=False)
        created: List[Prescription] = []
        for item in items:
            if not item.medicine_name or not item.medicine_name.strip():
                continue
            data = _prepare_prescription_dict(visit_id, item)
            data["medicine_name"] = item.medicine_name.strip()
            db_obj = Prescription(**data)
            db.add(db_obj)
            created.append(db_obj)
        db.commit()
        for obj in created:
            db.refresh(obj)
        return created
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save prescriptions: {exc}")

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
