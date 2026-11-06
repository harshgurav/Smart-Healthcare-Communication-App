from pydantic import BaseModel
from typing import Optional

class ClinicSettingsBase(BaseModel):
    doctor_name: Optional[str] = None
    qualifications: Optional[str] = None
    registration_no: Optional[str] = None
    clinic_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    timings: Optional[str] = None
    services: Optional[str] = None
    logo: Optional[str] = None

class ClinicSettingsUpdate(ClinicSettingsBase):
    pass

class ClinicSettingsResponse(ClinicSettingsBase):
    id: int

    class Config:
        from_attributes = True
