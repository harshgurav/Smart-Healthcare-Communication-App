from app.database import engine, SessionLocal
from app.models.patient import Patient
from app.models.visit import Visit
from sqlalchemy import text

# Test database connection
db = SessionLocal()
try:
    # Check if tables exist
    result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
    tables = [row[0] for row in result.fetchall()]
    print('Available tables:', tables)
    
    # Check patients
    patients = db.query(Patient).all()
    print(f'Number of patients: {len(patients)}')
    
    # Check visits
    visits = db.query(Visit).all()
    print(f'Number of visits: {len(visits)}')
    
    # Test creating a visit
    if patients:
        test_visit = Visit(
            patient_id=patients[0].patient_id,
            visit_date='2025-09-18',
            chief_complaint='Test complaint',
            symptoms='Test symptoms',
            diagnosis='Test diagnosis',
            treatment_plan='Test treatment',
            notes='Test notes'
        )
        db.add(test_visit)
        db.commit()
        print('Test visit created successfully')
    
except Exception as e:
    print(f'Database error: {e}')
    import traceback
    traceback.print_exc()
finally:
    db.close()