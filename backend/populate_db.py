from app.database import engine, SessionLocal
from app.models.patient import Patient, MedicalHistory
from app.models.visit import Visit, Prescription
from app.models.document import Document
from datetime import date, datetime

# Create all tables
from app.database import Base
Base.metadata.create_all(bind=engine)

# Create sample data
def populate_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Patient).count() > 0:
            print("Database already populated!")
            return
        
        # Create sample patients
        patients_data = [
            {
                "first_name": "Ramesh", "last_name": "Chandra", "age": 35, "sex": "Male",
                "height": 175.0, "weight": 70.5, "phone": "+91-9876543210",
                "email": "ramesh.chandra@email.com", "address": "123 MG Road, New Delhi",
                "emergency_contact": "Sunita Chandra", "emergency_phone": "+91-9876543211"
            },
            {
                "first_name": "Priya", "last_name": "Sharma", "age": 28, "sex": "Female",
                "height": 165.0, "weight": 60.0, "phone": "+91-9876543212",
                "email": "priya.sharma@email.com", "address": "456 Park Street, Mumbai",
                "emergency_contact": "Vikash Sharma", "emergency_phone": "+91-9876543213"
            },
            {
                "first_name": "Rajesh", "last_name": "Kumar", "age": 45, "sex": "Male",
                "height": 180.0, "weight": 85.0, "phone": "+91-9876543214",
                "email": "rajesh.kumar@email.com", "address": "789 Brigade Road, Bangalore",
                "emergency_contact": "Meera Kumar", "emergency_phone": "+91-9876543215"
            }
        ]
        
        for patient_data in patients_data:
            patient = Patient(**patient_data)
            db.add(patient)
        
        db.commit()
        
        # Get patient IDs
        patients = db.query(Patient).all()
        
        # Create medical history
        medical_histories = [
            {
                "patient_id": patients[0].patient_id,
                "allergies": "Penicillin, Shellfish",
                "chronic_conditions": "Hypertension",
                "permanent_medications": "Amlodipine 5mg daily",
                "family_history": "Father: Diabetes, Mother: Hypertension",
                "lifestyle_notes": "Non-smoker, Occasional alcohol"
            },
            {
                "patient_id": patients[1].patient_id,
                "allergies": "None known",
                "chronic_conditions": "None",
                "permanent_medications": "None",
                "family_history": "No significant family history",
                "lifestyle_notes": "Active lifestyle, Vegetarian"
            },
            {
                "patient_id": patients[2].patient_id,
                "allergies": "Aspirin",
                "chronic_conditions": "Type 2 Diabetes, Hypertension",
                "permanent_medications": "Metformin 500mg twice daily, Lisinopril 10mg daily",
                "family_history": "Father: Heart disease",
                "lifestyle_notes": "Former smoker, Regular exercise"
            }
        ]
        
        for history_data in medical_histories:
            history = MedicalHistory(**history_data)
            db.add(history)
        
        # Create sample visits
        visits_data = [
            {
                "patient_id": patients[0].patient_id,
                "visit_date": date(2025, 9, 15),
                "chief_complaint": "Routine checkup",
                "symptoms": "No specific complaints",
                "diagnosis": "Hypertension - well controlled",
                "treatment_plan": "Continue current medication",
                "follow_up_date": date(2025, 12, 15),
                "notes": "BP: 130/80, Patient compliant with medication"
            },
            {
                "patient_id": patients[1].patient_id,
                "visit_date": date(2025, 9, 10),
                "chief_complaint": "Annual physical",
                "symptoms": "Feeling healthy",
                "diagnosis": "Normal physical examination",
                "treatment_plan": "Maintain healthy lifestyle",
                "follow_up_date": date(2026, 9, 10),
                "notes": "All vitals normal, encouraged continued exercise"
            },
            {
                "patient_id": patients[2].patient_id,
                "visit_date": date(2025, 9, 12),
                "chief_complaint": "Diabetes follow-up",
                "symptoms": "Increased thirst",
                "diagnosis": "Diabetes - needs adjustment",
                "treatment_plan": "Increase Metformin dose",
                "follow_up_date": date(2025, 10, 12),
                "notes": "HbA1c: 8.2%, needs better control"
            }
        ]
        
        for visit_data in visits_data:
            visit = Visit(**visit_data)
            db.add(visit)
        
        db.commit()
        print("Database populated successfully!")
        
    except Exception as e:
        print(f"Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()