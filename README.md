# Patient Management System

A clean, minimal patient management system designed for single-doctor practices, featuring AI-powered patient summaries, comprehensive medical record tracking, and an intuitive glass morphism UI design.

## Features

- Patient registration and management
- Visit tracking with timeline view
- AI-powered patient summaries
- Prescription management
- Document storage and retrieval
- Advanced search and filtering

## Tech Stack

**Frontend:**
- React with Vite
- Tailwind CSS + HeadlessUI
- React Query + Zustand
- React Router v6

**Backend:**
- Python FastAPI
- MySQL with SQLAlchemy ORM
- OpenAI API integration

## Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
patient-management-system/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── database/          # SQL schema files
└── docs/             # Documentation
```