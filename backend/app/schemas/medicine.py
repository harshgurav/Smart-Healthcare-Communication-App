from pydantic import BaseModel
from typing import Optional

class MedicineBase(BaseModel):
    name: str
    strength: Optional[str] = None
    form: Optional[str] = None

class MedicineResponse(MedicineBase):
    id: int

    class Config:
        from_attributes = True
