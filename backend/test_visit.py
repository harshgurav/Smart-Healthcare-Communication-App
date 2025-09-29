from app.database import SessionLocal
from app.models.patient import Patient
from app.models.visit import Visit
from app.schemas.visit import VisitCreate
from datetime import date

# Test visit creation with string date
db = SessionLocal()
try:
    # Get first patient
    patient = db.query(Patient).first()
    if patient:
        # Test with string date (as it comes from frontend)
        visit_data = {
            "visit_date": "2025-09-18",
            "chief_complaint": "Test complaint",
            "symptoms": "Test symptoms", 
            "diagnosis": "Test diagnosis",
            "treatment_plan": "Test treatment",
            "follow_up_date": "2025-10-18",
            "notes": "Test notes"
        }
        
        # Create visit schema object (this will convert string dates)
        visit_create = VisitCreate(**visit_data)
        print("Visit schema created:", visit_create.dict())
        
        # Create database object
        db_visit = Visit(**visit_create.dict())
        db_visit.patient_id = patient.patient_id
        
        db.add(db_visit)
        db.commit()
        db.refresh(db_visit)
        
        print(f"Visit created successfully with ID: {db_visit.visit_id}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()