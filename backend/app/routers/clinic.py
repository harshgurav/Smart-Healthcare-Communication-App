from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.clinic import ClinicSettings
from app.schemas.clinic import ClinicSettingsResponse, ClinicSettingsUpdate

router = APIRouter()

DEFAULT_CLINIC_SETTINGS = {
    "doctor_name": "Dr. Sarah Wilson",
    "qualifications": "MBBS, MD (General Medicine)",
    "registration_no": "MCI-45892 / DMC-28410",
    "clinic_name": "Arogya Care Clinic & Diagnostic Centre",
    "address": "102, Ground Floor, Shanti Nagar Market, New Delhi - 110049",
    "phone": "+91-9811223344, 011-26543210",
    "timings": "Mon - Sat: 9:30 AM - 1:30 PM & 5:30 PM - 9:00 PM (Sun Closed)",
    "services": "General Consultation • Diabetes & Hypertension Management • ECG • Nebulization • Vaccination • Routine Lab Investigations",
    "logo": None,
}

def get_or_create_clinic_settings(db: Session) -> ClinicSettings:
    clinic = db.query(ClinicSettings).first()
    if not clinic:
        clinic = ClinicSettings(**DEFAULT_CLINIC_SETTINGS)
        db.add(clinic)
        db.commit()
        db.refresh(clinic)
    return clinic

@router.get("/clinic", response_model=ClinicSettingsResponse)
async def get_clinic_settings(db: Session = Depends(get_db)):
    return get_or_create_clinic_settings(db)

@router.put("/clinic", response_model=ClinicSettingsResponse)
async def update_clinic_settings(
    settings_update: ClinicSettingsUpdate,
    db: Session = Depends(get_db)
):
    clinic = get_or_create_clinic_settings(db)
    for field, value in settings_update.dict(exclude_unset=True).items():
        if value is not None or field == "logo":
            setattr(clinic, field, value)
    db.commit()
    db.refresh(clinic)
    return clinic
