from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import patients, visits, prescriptions, documents, ai, medicines, clinic
from app.seed import init_and_seed_db

# Ensure schema migrations, create database tables, and seed initial data
init_and_seed_db()

app = FastAPI(
    title="Patient Management System API",
    description="A comprehensive API for managing patient records, visits, and medical data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router, prefix="/api", tags=["patients"])
app.include_router(visits.router, prefix="/api", tags=["visits"])
app.include_router(prescriptions.router, prefix="/api", tags=["prescriptions"])
app.include_router(medicines.router, prefix="/api", tags=["medicines"])
app.include_router(clinic.router, prefix="/api", tags=["clinic"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(ai.router, prefix="/api", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Patient Management System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
