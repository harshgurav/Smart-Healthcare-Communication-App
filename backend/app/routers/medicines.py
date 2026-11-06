from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from typing import List
from app.database import get_db
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineResponse

router = APIRouter()

def search_medicines_db(db: Session, q: str = "", limit: int = 8) -> List[Medicine]:
    cleaned = (q or "").strip()
    if not cleaned:
        return db.query(Medicine).order_by(Medicine.id.asc()).limit(limit).all()

    lower_q = cleaned.lower()
    prefix_pattern = f"{lower_q}%"
    contains_pattern = f"%{lower_q}%"

    priority = case(
        (func.lower(Medicine.name).like(prefix_pattern), 0),
        else_=1
    )

    return (
        db.query(Medicine)
        .filter(func.lower(Medicine.name).like(contains_pattern))
        .order_by(priority.asc(), Medicine.name.asc())
        .limit(limit)
        .all()
    )

@router.get("/medicines/search", response_model=List[MedicineResponse])
async def search_medicines_endpoint(
    q: str = Query("", description="Search query for medicine name"),
    db: Session = Depends(get_db)
):
    return search_medicines_db(db, q=q, limit=8)
