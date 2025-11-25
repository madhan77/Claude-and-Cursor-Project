-- Initialize Healthcare Management System Database
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS healthcare;

-- Set search path
SET search_path TO healthcare, public;

-- Create enum types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show');
CREATE TYPE user_role AS ENUM ('admin', 'physician', 'nurse', 'receptionist', 'patient', 'billing');

-- Create audit trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA healthcare TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA healthcare TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA healthcare TO admin;
