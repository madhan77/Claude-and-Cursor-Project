-- Migration: Add New Features for Airline Reservation System
-- Features: Seat Selection, Baggage, Meals, Insurance, Loyalty, Multi-City, Check-in,
--           Special Assistance, Group Booking, Promo Codes

-- ============================================================================
-- 1. SEAT SELECTION SYSTEM
-- ============================================================================

-- Seat Maps: Define aircraft seat layouts
CREATE TABLE IF NOT EXISTS seat_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aircraft_id UUID REFERENCES aircraft(id) ON DELETE CASCADE,
    seat_number VARCHAR(5) NOT NULL,
    row_number INTEGER NOT NULL,
    column_letter VARCHAR(2) NOT NULL,
    class VARCHAR(20) NOT NULL CHECK (class IN ('economy', 'business', 'first')),
    type VARCHAR(30) DEFAULT 'standard' CHECK (type IN ('standard', 'extra_legroom', 'exit_row', 'window', 'aisle', 'middle')),
    is_available_for_selection BOOLEAN DEFAULT TRUE,
    extra_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aircraft_id, seat_number)
);

-- Seat Selections: Track seat assignments per passenger
CREATE TABLE IF NOT EXISTS seat_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    seat_number VARCHAR(5) NOT NULL,
    seat_class VARCHAR(20) NOT NULL,
    extra_charge DECIMAL(10, 2) DEFAULT 0,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flight_id, seat_number)
);

CREATE INDEX idx_seat_selections_booking ON seat_selections(booking_id);
CREATE INDEX idx_seat_selections_flight ON seat_selections(flight_id);

-- ============================================================================
-- 2. BAGGAGE MANAGEMENT
-- ============================================================================

-- Baggage Options: Available baggage types and pricing
CREATE TABLE IF NOT EXISTS baggage_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_code VARCHAR(3) REFERENCES airlines(code),
    baggage_type VARCHAR(30) NOT NULL CHECK (baggage_type IN ('carry_on', 'checked', 'oversized', 'sports_equipment', 'pet')),
    weight_limit INTEGER, -- in kg
    dimension_limit VARCHAR(50), -- e.g., "55x40x23 cm"
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Baggage: Track baggage selections per booking
CREATE TABLE IF NOT EXISTS booking_baggage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    baggage_option_id UUID REFERENCES baggage_options(id),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_baggage_booking ON booking_baggage(booking_id);

-- ============================================================================
-- 3. MEAL PREFERENCES
-- ============================================================================

-- Meal Options: Available meal types with dietary information
CREATE TABLE IF NOT EXISTS meal_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_code VARCHAR(3) REFERENCES airlines(code),
    meal_code VARCHAR(10) NOT NULL, -- e.g., VGML, HNML, KSML
    meal_name VARCHAR(100) NOT NULL,
    description TEXT,
    dietary_type VARCHAR(50), -- vegetarian, vegan, halal, kosher, gluten-free, etc.
    allergen_info TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    class_availability VARCHAR(20)[] DEFAULT ARRAY['economy', 'business', 'first'], -- which classes can order
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Meals: Meal selections per passenger
CREATE TABLE IF NOT EXISTS booking_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    meal_option_id UUID REFERENCES meal_options(id),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2) DEFAULT 0,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_meals_booking ON booking_meals(booking_id);
CREATE INDEX idx_booking_meals_passenger ON booking_meals(passenger_id);

-- ============================================================================
-- 4. TRAVEL INSURANCE
-- ============================================================================

-- Insurance Products: Available insurance plans
CREATE TABLE IF NOT EXISTS insurance_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(100) NOT NULL,
    product_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    coverage_amount DECIMAL(12, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    coverage_details JSONB, -- detailed coverage: medical, cancellation, baggage, etc.
    terms_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Insurance: Insurance purchases per booking
CREATE TABLE IF NOT EXISTS booking_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id),
    insurance_product_id UUID REFERENCES insurance_products(id),
    policy_number VARCHAR(50) UNIQUE,
    coverage_start_date DATE NOT NULL,
    coverage_end_date DATE NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'claimed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_insurance_booking ON booking_insurance(booking_id);

-- ============================================================================
-- 5. FREQUENT FLYER / LOYALTY PROGRAM
-- ============================================================================

-- Loyalty Programs: Airline loyalty programs
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_code VARCHAR(3) REFERENCES airlines(code),
    program_name VARCHAR(100) NOT NULL,
    program_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    points_per_mile DECIMAL(5, 2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Tiers: Membership levels (Silver, Gold, Platinum, etc.)
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    tier_name VARCHAR(50) NOT NULL,
    tier_level INTEGER NOT NULL, -- 1 = basic, 2 = silver, 3 = gold, etc.
    min_points_required INTEGER DEFAULT 0,
    benefits JSONB, -- priority boarding, lounge access, extra baggage, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, tier_level)
);

-- Loyalty Members: Frequent flyer accounts
CREATE TABLE IF NOT EXISTS loyalty_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES loyalty_programs(id),
    tier_id UUID REFERENCES loyalty_tiers(id),
    membership_number VARCHAR(50) UNIQUE NOT NULL,
    points_balance INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier_points INTEGER DEFAULT 0, -- points for tier qualification
    member_since DATE DEFAULT CURRENT_DATE,
    tier_expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, program_id)
);

-- Loyalty Transactions: Points earning and redemption
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust')),
    points INTEGER NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loyalty_transactions_member ON loyalty_transactions(member_id);
CREATE INDEX idx_loyalty_members_user ON loyalty_members(user_id);

-- ============================================================================
-- 6. MULTI-CITY FLIGHTS
-- ============================================================================

-- Itineraries: Container for multi-city trips
CREATE TABLE IF NOT EXISTS itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    trip_type VARCHAR(20) NOT NULL CHECK (trip_type IN ('one_way', 'round_trip', 'multi_city')),
    total_segments INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itinerary Segments: Individual flight legs in multi-city trip
CREATE TABLE IF NOT EXISTS itinerary_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id),
    segment_order INTEGER NOT NULL, -- 1, 2, 3, etc.
    departure_airport VARCHAR(3) REFERENCES airports(code),
    arrival_airport VARCHAR(3) REFERENCES airports(code),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(itinerary_id, segment_order)
);

CREATE INDEX idx_itinerary_segments_itinerary ON itinerary_segments(itinerary_id);

-- ============================================================================
-- 7. ONLINE CHECK-IN
-- ============================================================================

-- Check-in Records: Track online check-in status
CREATE TABLE IF NOT EXISTS check_in_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_method VARCHAR(20) DEFAULT 'online' CHECK (check_in_method IN ('online', 'mobile', 'kiosk', 'counter')),
    seat_number VARCHAR(5),
    boarding_group VARCHAR(5),
    boarding_time TIMESTAMP,
    gate VARCHAR(10),
    terminal VARCHAR(10),
    status VARCHAR(20) DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'boarded', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(passenger_id, flight_id)
);

-- Boarding Passes: Generated boarding pass data
CREATE TABLE IF NOT EXISTS boarding_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_record_id UUID REFERENCES check_in_records(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    barcode VARCHAR(255) NOT NULL, -- Could be QR code data or barcode number
    boarding_pass_number VARCHAR(50) UNIQUE NOT NULL,
    seat_number VARCHAR(5),
    boarding_group VARCHAR(5),
    boarding_time TIMESTAMP,
    gate VARCHAR(10),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_check_in_records_booking ON check_in_records(booking_id);
CREATE INDEX idx_check_in_records_flight ON check_in_records(flight_id);
CREATE INDEX idx_boarding_passes_passenger ON boarding_passes(passenger_id);

-- ============================================================================
-- 8. PRICE HISTORY & CALENDAR (enhancement to existing price_alerts)
-- ============================================================================

-- Price History: Track flight price changes for calendar view
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    class VARCHAR(20) NOT NULL CHECK (class IN ('economy', 'business', 'first')),
    price DECIMAL(10, 2) NOT NULL,
    available_seats INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_flight ON price_history(flight_id, class, recorded_at);

-- ============================================================================
-- 9. SPECIAL ASSISTANCE REQUESTS
-- ============================================================================

-- Special Assistance Requests: Detailed special service requests
CREATE TABLE IF NOT EXISTS special_assistance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES passengers(id) ON DELETE CASCADE,
    assistance_type VARCHAR(50) NOT NULL CHECK (assistance_type IN (
        'wheelchair', 'wheelchair_own', 'medical_equipment', 'oxygen',
        'service_animal', 'pet_in_cabin', 'unaccompanied_minor',
        'pregnant', 'elderly', 'visual_impairment', 'hearing_impairment', 'other'
    )),
    description TEXT,
    special_equipment_details TEXT,
    confirmation_status VARCHAR(20) DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'confirmed', 'denied')),
    airline_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_special_assistance_booking ON special_assistance_requests(booking_id);

-- ============================================================================
-- 10. GROUP BOOKING
-- ============================================================================

-- Group Bookings: Manage group reservations
CREATE TABLE IF NOT EXISTS group_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(255) NOT NULL,
    group_code VARCHAR(20) UNIQUE NOT NULL,
    contact_person_id UUID REFERENCES users(id),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    total_passengers INTEGER NOT NULL,
    min_passengers INTEGER, -- minimum for group discount
    booking_deadline DATE,
    special_requests TEXT,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Booking Members: Individual bookings within a group
CREATE TABLE IF NOT EXISTS group_booking_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_booking_id UUID REFERENCES group_bookings(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_name VARCHAR(255),
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_booking_id, booking_id)
);

CREATE INDEX idx_group_booking_members_group ON group_booking_members(group_booking_id);

-- ============================================================================
-- 11. PROMO CODES & DISCOUNTS
-- ============================================================================

-- Promo Codes: Discount codes and promotional offers
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2), -- cap for percentage discounts
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INTEGER, -- total usage limit
    usage_per_user INTEGER DEFAULT 1, -- usage limit per user
    applicable_routes VARCHAR(6)[], -- array of route codes, NULL = all routes
    applicable_classes VARCHAR(20)[] DEFAULT ARRAY['economy', 'business', 'first'],
    airline_code VARCHAR(3) REFERENCES airlines(code), -- NULL = all airlines
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo Code Usage: Track promo code usage
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_code_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_user ON promo_code_usage(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update group_bookings updated_at
CREATE TRIGGER update_group_bookings_updated_at BEFORE UPDATE ON group_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================

-- Insert default loyalty program
INSERT INTO loyalty_programs (airline_code, program_name, program_code, points_per_mile)
VALUES
    ('AA', 'AAdvantage', 'AAV', 1.0),
    ('UA', 'MileagePlus', 'MPL', 1.0),
    ('DL', 'SkyMiles', 'SKM', 1.0),
    ('BA', 'Executive Club', 'BEC', 1.0),
    ('EK', 'Skywards', 'EKS', 1.0)
ON CONFLICT DO NOTHING;

-- Insert loyalty tiers for each program
DO $$
DECLARE
    prog_id UUID;
BEGIN
    FOR prog_id IN SELECT id FROM loyalty_programs LOOP
        INSERT INTO loyalty_tiers (program_id, tier_name, tier_level, min_points_required, benefits)
        VALUES
            (prog_id, 'Blue', 1, 0, '{"priority_boarding": false, "lounge_access": false, "extra_baggage": 0}'::jsonb),
            (prog_id, 'Silver', 2, 25000, '{"priority_boarding": true, "lounge_access": false, "extra_baggage": 1}'::jsonb),
            (prog_id, 'Gold', 3, 50000, '{"priority_boarding": true, "lounge_access": true, "extra_baggage": 2}'::jsonb),
            (prog_id, 'Platinum', 4, 100000, '{"priority_boarding": true, "lounge_access": true, "extra_baggage": 3, "upgrades": true}'::jsonb)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Insert baggage options for each airline
INSERT INTO baggage_options (airline_code, baggage_type, weight_limit, dimension_limit, price, description)
SELECT
    code,
    'carry_on',
    7,
    '55x40x23 cm',
    0.00,
    'Free carry-on baggage'
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO baggage_options (airline_code, baggage_type, weight_limit, dimension_limit, price, description)
SELECT
    code,
    'checked',
    23,
    '158 cm total',
    35.00,
    'Standard checked baggage'
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO baggage_options (airline_code, baggage_type, weight_limit, dimension_limit, price, description)
SELECT
    code,
    'oversized',
    32,
    '203 cm total',
    75.00,
    'Oversized checked baggage'
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO baggage_options (airline_code, baggage_type, weight_limit, dimension_limit, price, description)
SELECT
    code,
    'sports_equipment',
    23,
    'Varies',
    50.00,
    'Sports equipment (golf, ski, surfboard)'
FROM airlines
ON CONFLICT DO NOTHING;

-- Insert meal options for each airline
INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'STND',
    'Standard Meal',
    'Regular meal service',
    'standard',
    0.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'VGML',
    'Vegetarian Meal',
    'Vegetarian meal (no meat, poultry, or fish)',
    'vegetarian',
    0.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'HNML',
    'Hindu Meal',
    'Hindu meal (non-vegetarian)',
    'hindu',
    0.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'KSML',
    'Kosher Meal',
    'Kosher meal prepared according to Jewish dietary laws',
    'kosher',
    5.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'MOML',
    'Muslim Meal',
    'Halal meal prepared according to Islamic dietary laws',
    'halal',
    0.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'GFML',
    'Gluten-Free Meal',
    'Gluten-free meal for celiac or gluten intolerance',
    'gluten_free',
    5.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

INSERT INTO meal_options (airline_code, meal_code, meal_name, description, dietary_type, price, class_availability)
SELECT
    code,
    'VLML',
    'Vegan Meal',
    'Vegan meal (no animal products)',
    'vegan',
    0.00,
    ARRAY['economy', 'business', 'first']
FROM airlines
ON CONFLICT DO NOTHING;

-- Insert insurance products
INSERT INTO insurance_products (product_name, product_code, description, coverage_amount, price, coverage_details)
VALUES
    (
        'Basic Travel Insurance',
        'BTI',
        'Basic coverage for trip cancellation and medical emergencies',
        50000.00,
        29.99,
        '{"trip_cancellation": 5000, "medical": 50000, "baggage_loss": 1000, "travel_delay": 500}'::jsonb
    ),
    (
        'Premium Travel Insurance',
        'PTI',
        'Comprehensive coverage including trip cancellation, medical, and more',
        100000.00,
        59.99,
        '{"trip_cancellation": 10000, "medical": 100000, "baggage_loss": 2000, "travel_delay": 1000, "flight_accident": 100000}'::jsonb
    ),
    (
        'Premium Plus Travel Insurance',
        'PPTI',
        'Ultimate protection with maximum coverage limits',
        250000.00,
        99.99,
        '{"trip_cancellation": 25000, "medical": 250000, "baggage_loss": 5000, "travel_delay": 2000, "flight_accident": 250000, "emergency_evacuation": 50000}'::jsonb
    )
ON CONFLICT (product_code) DO NOTHING;

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, valid_from, valid_until, usage_limit, is_active)
VALUES
    ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10.00, 100.00, 50.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 1000, true),
    ('SUMMER25', 'Summer sale - 25% off', 'percentage', 25.00, 200.00, 100.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days', 500, true),
    ('FLAT50', 'Flat $50 discount', 'fixed_amount', 50.00, 300.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 200, true),
    ('BUSINESS20', 'Business class discount - 20% off', 'percentage', 20.00, 500.00, 200.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '120 days', NULL, true),
    ('EARLYBIRD', 'Early bird special - $75 off', 'fixed_amount', 75.00, 400.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '180 days', NULL, true)
ON CONFLICT (code) DO NOTHING;
