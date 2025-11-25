-- Migration: Create Medical Records Tables
-- Description: Medical history, allergies, medications, and problem list
-- Created: 2025-11-17

SET search_path TO healthcare, public;

-- Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction TEXT,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
    onset_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_allergies_patient ON allergies(patient_id) WHERE deleted_at IS NULL AND is_active = true;

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),
    instructions TEXT,
    start_date DATE,
    end_date DATE,
    prescribed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_medications_patient ON medications(patient_id) WHERE deleted_at IS NULL AND is_active = true;

-- Problem List Table
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    problem_name VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(10),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'resolved')),
    onset_date DATE,
    resolution_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_problems_patient ON problems(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_problems_status ON problems(status) WHERE deleted_at IS NULL;

-- Immunizations Table
CREATE TABLE IF NOT EXISTS immunizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    cvx_code VARCHAR(10),
    administered_date DATE NOT NULL,
    administered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    lot_number VARCHAR(50),
    manufacturer VARCHAR(100),
    site VARCHAR(50),
    route VARCHAR(50),
    dose VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_immunizations_patient ON immunizations(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_immunizations_date ON immunizations(administered_date) WHERE deleted_at IS NULL;

-- Add triggers
CREATE TRIGGER update_allergies_updated_at
    BEFORE UPDATE ON allergies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_immunizations_updated_at
    BEFORE UPDATE ON immunizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
