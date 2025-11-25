-- Migration: Create Patients Table
-- Description: Patient records with demographics and medical information
-- Created: 2025-11-17

SET search_path TO healthcare, public;

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender gender_type,
    ssn VARCHAR(256), -- Encrypted
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'USA',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    blood_type VARCHAR(5),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_dob CHECK (date_of_birth <= CURRENT_DATE),
    CONSTRAINT valid_mrn CHECK (mrn ~ '^[A-Z0-9]{6,20}$')
);

-- Create indexes
CREATE UNIQUE INDEX idx_patients_mrn ON patients(mrn) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_user_id ON patients(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_name ON patients(last_name, first_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_dob ON patients(date_of_birth) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_email ON patients(email) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE patients IS 'Patient demographics and basic information';
COMMENT ON COLUMN patients.mrn IS 'Medical Record Number - unique patient identifier';
COMMENT ON COLUMN patients.ssn IS 'Social Security Number - stored encrypted';
COMMENT ON COLUMN patients.user_id IS 'Link to user account for patient portal access';
