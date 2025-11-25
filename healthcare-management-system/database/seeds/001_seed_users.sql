-- Seed Users
-- Password for all test users: Password123!
-- Hashed using bcrypt with cost factor 10

SET search_path TO healthcare, public;

INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, is_active, is_email_verified) VALUES
    -- Admin User
    ('11111111-1111-1111-1111-111111111111', 'admin@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'System', 'Administrator', 'admin', '+1-555-0001', true, true),

    -- Physicians
    ('22222222-2222-2222-2222-222222222222', 'dr.smith@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Sarah', 'Smith', 'physician', '+1-555-0002', true, true),
    ('33333333-3333-3333-3333-333333333333', 'dr.johnson@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Michael', 'Johnson', 'physician', '+1-555-0003', true, true),
    ('44444444-4444-4444-4444-444444444444', 'dr.williams@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Emily', 'Williams', 'physician', '+1-555-0004', true, true),

    -- Nurses
    ('55555555-5555-5555-5555-555555555555', 'nurse.jones@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Jennifer', 'Jones', 'nurse', '+1-555-0005', true, true),
    ('66666666-6666-6666-6666-666666666666', 'nurse.brown@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'David', 'Brown', 'nurse', '+1-555-0006', true, true),

    -- Receptionist
    ('77777777-7777-7777-7777-777777777777', 'reception@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Maria', 'Rodriguez', 'receptionist', '+1-555-0007', true, true),

    -- Billing Staff
    ('88888888-8888-8888-8888-888888888888', 'billing@healthcare.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Robert', 'Davis', 'billing', '+1-555-0008', true, true),

    -- Patient Users
    ('99999999-9999-9999-9999-999999999999', 'john.doe@email.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'John', 'Doe', 'patient', '+1-555-1001', true, true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'jane.smith@email.com', '$2b$10$rZqN8e8JZ8YvWQKXvGxHXOz7z7bX7L7qN8e8JZ8YvWQKXvGxHXOz7', 'Jane', 'Smith', 'patient', '+1-555-1002', true, true);
