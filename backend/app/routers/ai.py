from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient, MedicalHistory
from app.models.visit import Visit
from typing import List
import os

router = APIRouter()

# Mock AI responses for demo
MOCK_RESPONSES = {
    "patient_summary": {
        "chronic_hypertension": "Patient shows well-controlled hypertension with regular medication compliance. Recent visits indicate stable blood pressure readings.",
        "diabetes_type2": "Type 2 diabetes managed with lifestyle modifications and medication. HbA1c levels require monitoring.",
        "default": "Patient presents with routine medical history requiring regular monitoring and preventive care."
    },
    "medicine_suggestions": [
        "Paracetamol 500mg", "Ibuprofen 400mg", "Amoxicillin 250mg",
        "Amlodipine 5mg", "Metformin 500mg", "Lisinopril 10mg",
        "Aspirin 75mg", "Omeprazole 20mg", "Atorvastatin 20mg"
    ]
}

@router.post("/patients/{patient_id}/summary")
async def generate_patient_summary(patient_id: int, db: Session = Depends(get_db)):
    # Get patient data
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get medical history
    medical_history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).first()
    
    # Get recent visits
    recent_visits = db.query(Visit).filter(Visit.patient_id == patient_id).order_by(Visit.visit_date.desc()).limit(3).all()
    
    # Generate summary (mock for demo)
    summary_key = "default"
    if medical_history and medical_history.chronic_conditions:
        if "hypertension" in medical_history.chronic_conditions.lower():
            summary_key = "chronic_hypertension"
        elif "diabetes" in medical_history.chronic_conditions.lower():
            summary_key = "diabetes_type2"
    
    summary = MOCK_RESPONSES["patient_summary"][summary_key]
    
    # Generate insights
    insights = []
    recommendations = []
    
    if medical_history:
        if medical_history.chronic_conditions:
            insights.append(f"Chronic conditions: {medical_history.chronic_conditions}")
        if medical_history.allergies:
            insights.append(f"Known allergies: {medical_history.allergies}")
            recommendations.append("Review allergy list before prescribing")
    
    if recent_visits:
        insights.append(f"Last visit: {recent_visits[0].visit_date}")
        if recent_visits[0].follow_up_date:
            recommendations.append(f"Follow-up scheduled for {recent_visits[0].follow_up_date}")
    
    return {
        "patient_id": patient_id,
        "summary": summary,
        "key_insights": insights,
        "recommendations": recommendations
    }

@router.post("/ai/medicine-search")
async def search_medicines(query: str):
    # Filter medicines based on query (mock implementation)
    medicines = MOCK_RESPONSES["medicine_suggestions"]
    filtered = [med for med in medicines if query.lower() in med.lower()]
    return {"suggestions": filtered[:5]}

@router.post("/ai/diagnosis-assist")
async def diagnosis_assist(symptoms: List[str]):
    # Mock diagnosis suggestions
    mock_diagnoses = [
        "Upper respiratory tract infection",
        "Viral fever",
        "Gastroenteritis",
        "Hypertension",
        "Type 2 Diabetes Mellitus"
    ]
    return {"suggested_diagnoses": mock_diagnoses[:3]}