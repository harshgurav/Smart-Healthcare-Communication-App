-- Patient Management System Database Schema

-- Patients Table
CREATE TABLE patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT,
    sex ENUM('Male', 'Female', 'Other'),
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medical History Table
CREATE TABLE medical_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    allergies TEXT,
    chronic_conditions TEXT,
    permanent_medications TEXT,
    family_history TEXT,
    lifestyle_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Visits Table
CREATE TABLE visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    visit_date DATE,
    chief_complaint TEXT,
    symptoms TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT,
    medicine_name VARCHAR(100),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    instructions TEXT,
    FOREIGN KEY (visit_id) REFERENCES visits(visit_id)
);

-- Documents Table
CREATE TABLE documents (
    document_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    visit_id INT,
    document_type ENUM('Lab Report', 'X-Ray', 'MRI', 'Prescription', 'Other'),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (visit_id) REFERENCES visits(visit_id)
);

-- Sample Data
INSERT INTO patients (first_name, last_name, age, sex, height, weight, phone, email, address, emergency_contact, emergency_phone) VALUES
('Ramesh', 'Chandra', 35, 'Male', 175.0, 70.5, '+91-9876543210', 'ramesh.chandra@email.com', '123 MG Road, New Delhi', 'Sunita Chandra', '+91-9876543211'),
('Priya', 'Sharma', 28, 'Female', 165.0, 60.0, '+91-9876543212', 'priya.sharma@email.com', '456 Park Street, Mumbai', 'Vikash Sharma', '+91-9876543213'),
('Rajesh', 'Kumar', 45, 'Male', 180.0, 85.0, '+91-9876543214', 'rajesh.kumar@email.com', '789 Brigade Road, Bangalore', 'Meera Kumar', '+91-9876543215');

INSERT INTO medical_history (patient_id, allergies, chronic_conditions, permanent_medications, family_history, lifestyle_notes) VALUES
(1, 'Penicillin, Shellfish', 'Hypertension', 'Amlodipine 5mg daily', 'Father: Diabetes, Mother: Hypertension', 'Non-smoker, Occasional alcohol'),
(2, 'None known', 'None', 'None', 'No significant family history', 'Active lifestyle, Vegetarian'),
(3, 'Aspirin', 'Type 2 Diabetes, Hypertension', 'Metformin 500mg twice daily, Lisinopril 10mg daily', 'Father: Heart disease', 'Former smoker, Regular exercise');

INSERT INTO visits (patient_id, visit_date, chief_complaint, symptoms, diagnosis, treatment_plan, follow_up_date, notes) VALUES
(1, '2025-09-15', 'Routine checkup', 'No specific complaints', 'Hypertension - well controlled', 'Continue current medication', '2025-12-15', 'BP: 130/80, Patient compliant with medication'),
(2, '2025-09-10', 'Annual physical', 'Feeling healthy', 'Normal physical examination', 'Maintain healthy lifestyle', '2026-09-10', 'All vitals normal, encouraged continued exercise'),
(3, '2025-09-12', 'Diabetes follow-up', 'Increased thirst', 'Diabetes - needs adjustment', 'Increase Metformin dose', '2025-10-12', 'HbA1c: 8.2%, needs better control');