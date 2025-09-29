from pydantic import BaseModel, validator
from typing import Optional, Union
from datetime import date, datetime

class VisitBase(BaseModel):
    visit_date: Optional[date] = None
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None

class VisitCreate(VisitBase):
    @validator('visit_date', pre=True)
    def parse_visit_date(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, str):
            return datetime.strptime(v, '%Y-%m-%d').date()
        return v
    
    @validator('follow_up_date', pre=True)
    def parse_follow_up_date(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, str):
            return datetime.strptime(v, '%Y-%m-%d').date()
        return v

class VisitResponse(VisitBase):
    visit_id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True