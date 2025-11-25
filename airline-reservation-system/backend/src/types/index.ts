// User Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: Date;
  role: 'customer' | 'staff' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

// Airline Types
export interface Airline {
  code: string;
  name: string;
  logo_url?: string;
  country?: string;
  created_at: Date;
}

// Airport Types
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
}

// Aircraft Types
export interface Aircraft {
  id: string;
  model: string;
  manufacturer?: string;
  total_seats: number;
  economy_seats?: number;
  business_seats?: number;
  first_class_seats?: number;
  created_at: Date;
}

// Flight Types
export interface Flight {
  id: string;
  flight_number: string;
  airline_code: string;
  aircraft_id: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: Date;
  arrival_time: Date;
  duration: number;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'departed' | 'landed';
  base_price_economy?: number;
  base_price_business?: number;
  base_price_first?: number;
  available_seats_economy?: number;
  available_seats_business?: number;
  available_seats_first?: number;
  gate?: string;
  terminal?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FlightSearchParams {
  departure_airport: string;
  arrival_airport: string;
  departure_date: string;
  return_date?: string;
  adults: number;
  children?: number;
  infants?: number;
  class?: 'economy' | 'business' | 'first';
  max_stops?: number;
  max_price?: number;
  airlines?: string[];
  sort_by?: 'price' | 'duration' | 'departure' | 'arrival';
}

export interface FlightSearchResult extends Flight {
  airline: Airline;
  departure_airport_info: Airport;
  arrival_airport_info: Airport;
  aircraft: Aircraft;
  price: {
    economy?: number;
    business?: number;
    first?: number;
  };
}

// Seat Types
export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: 'economy' | 'business' | 'first';
  type: 'standard' | 'extra_legroom' | 'exit_row' | 'window' | 'aisle';
  is_available: boolean;
  extra_price: number;
  created_at: Date;
}

// Booking Types
export interface Booking {
  id: string;
  pnr: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_date: Date;
  total_price: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  contact_email: string;
  contact_phone?: string;
  special_requests?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookingRequest {
  flights: string[]; // flight IDs
  passengers: PassengerInfo[];
  contact_email: string;
  contact_phone?: string;
  ancillaries?: AncillaryServiceRequest[];
  payment_method: string;
  special_requests?: string;
}

// Passenger Types
export interface Passenger {
  id: string;
  booking_id: string;
  flight_id: string;
  type: 'adult' | 'child' | 'infant';
  title?: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: Date;
  seat_number?: string;
  frequent_flyer_number?: string;
  special_assistance?: string;
  meal_preference?: string;
  baggage_count: number;
  checked_in: boolean;
  boarding_pass_issued: boolean;
  created_at: Date;
}

export interface PassengerInfo {
  type: 'adult' | 'child' | 'infant';
  title?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  seat_number?: string;
  frequent_flyer_number?: string;
  special_assistance?: string;
  meal_preference?: string;
  baggage_count?: number;
}

// Ancillary Service Types
export interface AncillaryService {
  id: string;
  booking_id: string;
  passenger_id?: string;
  service_type: 'baggage' | 'meal' | 'seat' | 'insurance' | 'lounge' | 'wifi';
  description?: string;
  quantity: number;
  price: number;
  created_at: Date;
}

export interface AncillaryServiceRequest {
  passenger_id?: string;
  service_type: 'baggage' | 'meal' | 'seat' | 'insurance' | 'lounge' | 'wifi';
  description?: string;
  quantity: number;
  price: number;
}

// Payment Types
export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_gateway?: string;
  gateway_response?: string;
  created_at: Date;
}

export interface PaymentRequest {
  booking_id: string;
  payment_method: string;
  payment_token?: string;
  card_details?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  booking_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_via?: 'email' | 'sms' | 'push' | 'in_app';
  sent_at?: Date;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Request with User
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
