from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.visit import Visit
from app.schemas.visit import VisitCreate, VisitResponse
from datetime import date

router = APIRouter()

@router.get("/patients/{patient_id}/visits", response_model=List[VisitResponse])
async def get_patient_visits(patient_id: int, db: Session = Depends(get_db)):
    visits = db.query(Visit).filter(Visit.patient_id == patient_id).order_by(Visit.visit_date.desc()).all()
    return visits

@router.post("/patients/{patient_id}/visits", response_model=VisitResponse)
async def create_visit(patient_id: int, visit: VisitCreate, db: Session = Depends(get_db)):
    visit_data = visit.model_dump()
    visit_data["patient_id"] = patient_id
    db_visit = Visit(**visit_data)
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

@router.get("/visits/{visit_id}", response_model=VisitResponse)
async def get_visit(visit_id: int, db: Session = Depends(get_db)):
    visit = db.query(Visit).filter(Visit.visit_id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

@router.put("/visits/{visit_id}", response_model=VisitResponse)
async def update_visit(visit_id: int, visit_update: VisitCreate, db: Session = Depends(get_db)):
    visit = db.query(Visit).filter(Visit.visit_id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    for field, value in visit_update.model_dump(exclude_unset=True).items():
        setattr(visit, field, value)
    
    db.commit()
    db.refresh(visit)
    return visit