from pydantic import BaseModel, validator
from typing import Optional, List

VALID_FOOD_TIMINGS = {"before", "after", "with", "any"}

class PrescriptionBase(BaseModel):
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    morning: Optional[bool] = False
    noon: Optional[bool] = False
    night: Optional[bool] = False
    food_timing: Optional[str] = "after"
    duration_days: Optional[int] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

    @validator("morning", "noon", "night", pre=True, always=True)
    def default_bool(cls, v):
        if v is None:
            return False
        return bool(v)

    @validator("food_timing", pre=True, always=True)
    def validate_food_timing(cls, v):
        if v is None or v == "":
            return "after"
        val = str(v).strip().lower()
        if val not in VALID_FOOD_TIMINGS:
            raise ValueError(f"food_timing must be one of {sorted(VALID_FOOD_TIMINGS)}")
        return val

    @validator("duration_days", pre=True)
    def parse_duration_days(cls, v):
        if v is None or v == "":
            return None
        try:
            return int(v)
        except (ValueError, TypeError):
            return None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionBulkCreate(BaseModel):
    prescriptions: List[PrescriptionCreate]

class PrescriptionResponse(PrescriptionBase):
    prescription_id: int
    visit_id: int

    class Config:
        from_attributes = True
