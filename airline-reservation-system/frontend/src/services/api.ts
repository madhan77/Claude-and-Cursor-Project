import axios, { AxiosInstance } from 'axios';
import type {
  AuthResponse,
  Flight,
  FlightSearchParams,
  Airport,
  Booking,
  CreateBookingRequest,
  User
} from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api/v1';

// Log the API URL for debugging
console.log('🔗 API Base URL:', API_BASE_URL);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', data);
    return response.data.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/auth/profile');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put('/auth/profile', data);
    return response.data.data;
  }

  // Flight endpoints
  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    const response = await this.api.get('/flights/search', { params });
    return response.data.data;
  }

  async getFlightById(id: string): Promise<Flight> {
    const response = await this.api.get(`/flights/${id}`);
    return response.data.data;
  }

  async getFlightSeats(id: string) {
    const response = await this.api.get(`/flights/${id}/seats`);
    return response.data.data;
  }

  async getAirports(search?: string): Promise<Airport[]> {
    const response = await this.api.get('/flights/airports', {
      params: { search },
    });
    return response.data.data;
  }

  async getAirlines() {
    const response = await this.api.get('/flights/airlines');
    return response.data.data;
  }

  // Booking endpoints
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await this.api.post('/bookings', data);
    return response.data.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.api.get(`/bookings/${id}`);
    return response.data.data;
  }

  async getUserBookings(status?: string): Promise<Booking[]> {
    const response = await this.api.get('/bookings/my-bookings', {
      params: { status },
    });
    return response.data.data;
  }

  async cancelBooking(id: string): Promise<void> {
    await this.api.delete(`/bookings/${id}`);
  }

  // Promo code endpoints
  async validatePromoCode(code: string, bookingAmount: number, routeCode?: string, classType?: string, airlineCode?: string) {
    const response = await this.api.post('/promo/validate', {
      code,
      bookingAmount,
      routeCode,
      classType,
      airlineCode
    });
    return response.data;
  }

  async getActivePromoCodes() {
    const response = await this.api.get('/promo/active');
    return response.data.promoCodes;
  }

  // Seat selection endpoints
  async getFlightSeatMap(flightId: string) {
    const response = await this.api.get(`/seats/flight/${flightId}`);
    return response.data;
  }

  async selectSeat(bookingId: string, passengerId: string, flightId: string, seatNumber: string) {
    const response = await this.api.post('/seats/select', {
      bookingId,
      passengerId,
      flightId,
      seatNumber
    });
    return response.data;
  }

  async getBookingSeatSelections(bookingId: string) {
    const response = await this.api.get(`/seats/booking/${bookingId}`);
    return response.data.seatSelections;
  }

  // Baggage endpoints
  async getBaggageOptions(airlineCode?: string) {
    const response = await this.api.get('/ancillary/baggage/options', {
      params: { airlineCode }
    });
    return response.data.baggageOptions;
  }

  async addBaggage(bookingId: string, passengerId: string, baggageOptionId: string, quantity: number, specialNotes?: string) {
    const response = await this.api.post('/ancillary/baggage/add', {
      bookingId,
      passengerId,
      baggageOptionId,
      quantity,
      specialNotes
    });
    return response.data;
  }

  // Meal endpoints
  async getMealOptions(airlineCode?: string, dietaryType?: string) {
    const response = await this.api.get('/ancillary/meals/options', {
      params: { airlineCode, dietaryType }
    });
    return response.data.mealOptions;
  }

  async addMeal(bookingId: string, passengerId: string, flightId: string, mealOptionId: string, quantity: number, specialRequests?: string) {
    const response = await this.api.post('/ancillary/meals/add', {
      bookingId,
      passengerId,
      flightId,
      mealOptionId,
      quantity,
      specialRequests
    });
    return response.data;
  }

  // Insurance endpoints
  async getInsuranceProducts() {
    const response = await this.api.get('/ancillary/insurance/products');
    return response.data.insuranceProducts;
  }

  async addInsurance(bookingId: string, passengerId: string, insuranceProductId: string, coverageStartDate: string, coverageEndDate: string) {
    const response = await this.api.post('/ancillary/insurance/add', {
      bookingId,
      passengerId,
      insuranceProductId,
      coverageStartDate,
      coverageEndDate
    });
    return response.data;
  }

  async getBookingAncillaries(bookingId: string) {
    const response = await this.api.get(`/ancillary/booking/${bookingId}`);
    return response.data.ancillaries;
  }

  // Check-in endpoints
  async performOnlineCheckin(bookingId: string, passengerId: string, flightId: string) {
    const response = await this.api.post('/checkin/online', {
      bookingId,
      passengerId,
      flightId
    });
    return response.data;
  }

  async getBoardingPass(passengerId: string, flightId: string) {
    const response = await this.api.get(`/checkin/boarding-pass/${passengerId}/${flightId}`);
    return response.data.boardingPass;
  }

  async getCheckinStatus(bookingId: string) {
    const response = await this.api.get(`/checkin/status/${bookingId}`);
    return response.data.passengers;
  }

  // Loyalty endpoints
  async getLoyaltyPrograms() {
    const response = await this.api.get('/loyalty/programs');
    return response.data.programs;
  }

  async getMyMemberships() {
    const response = await this.api.get('/loyalty/my-memberships');
    return response.data.memberships;
  }

  async enrollInLoyaltyProgram(programId: string) {
    const response = await this.api.post('/loyalty/enroll', { programId });
    return response.data;
  }

  async getLoyaltyTransactions(membershipId: string, limit = 50, offset = 0) {
    const response = await this.api.get(`/loyalty/transactions/${membershipId}`, {
      params: { limit, offset }
    });
    return response.data.transactions;
  }
}

export default new ApiService();
