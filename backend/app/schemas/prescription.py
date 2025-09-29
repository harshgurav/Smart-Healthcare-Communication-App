from pydantic import BaseModel
from typing import Optional

class PrescriptionBase(BaseModel):
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionResponse(PrescriptionBase):
    prescription_id: int
    visit_id: int

    class Config:
        from_attributes = True