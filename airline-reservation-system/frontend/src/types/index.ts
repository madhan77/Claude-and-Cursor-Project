// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Flight Types
export interface Flight {
  id: string;
  flight_number: string;
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  departure: {
    airport: string;
    name: string;
    city: string;
    time: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    name: string;
    city: string;
    time: string;
  };
  duration: number;
  aircraft: string;
  status: string;
  price: {
    economy?: number;
    business?: number;
    first?: number;
  };
  available_seats: {
    economy?: number;
    business?: number;
    first?: number;
  };
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
}

// Airport Types
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Booking Types
export interface Passenger {
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
  meal_preference?: string;
  baggage_count?: number;
}

export interface Booking {
  id: string;
  pnr: string;
  status: string;
  booking_date: string;
  total_price: number;
  payment_status: string;
  flights?: Flight[];
  passengers?: Passenger[];
}

export interface CreateBookingRequest {
  flights: string[];
  passengers: Passenger[];
  contact_email: string;
  contact_phone?: string;
  payment_method: string;
  special_requests?: string;
}
