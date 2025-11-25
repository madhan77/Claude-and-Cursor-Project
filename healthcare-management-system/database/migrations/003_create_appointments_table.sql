-- Migration: Create Appointments Table
-- Description: Patient appointment scheduling and tracking
-- Created: 2025-11-17

SET search_path TO healthcare, public;

CREATE TABLE IF NOT EXISTS appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    color VARCHAR(7) DEFAULT '#1976d2',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_type_id UUID REFERENCES appointment_types(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    location VARCHAR(255),
    room_number VARCHAR(50),
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_scheduled_times CHECK (scheduled_end > scheduled_start),
    CONSTRAINT valid_actual_times CHECK (actual_end IS NULL OR actual_end > actual_start)
);

-- Create indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_provider ON appointments(provider_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_date ON appointments(scheduled_start) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status ON appointments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_provider_date ON appointments(provider_id, scheduled_start) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE appointments IS 'Patient appointments with scheduling information';
COMMENT ON COLUMN appointments.status IS 'Current status of the appointment';
COMMENT ON COLUMN appointments.scheduled_start IS 'Scheduled start time';
COMMENT ON COLUMN appointments.actual_start IS 'Actual start time when checked in';

-- Insert default appointment types
INSERT INTO appointment_types (name, description, duration_minutes, color) VALUES
    ('General Checkup', 'Routine health checkup', 30, '#4caf50'),
    ('Follow-up Visit', 'Follow-up appointment', 20, '#2196f3'),
    ('Consultation', 'Initial consultation', 45, '#ff9800'),
    ('Procedure', 'Medical procedure', 60, '#f44336'),
    ('Lab Work', 'Laboratory tests', 15, '#9c27b0'),
    ('Vaccination', 'Immunization appointment', 15, '#00bcd4');
