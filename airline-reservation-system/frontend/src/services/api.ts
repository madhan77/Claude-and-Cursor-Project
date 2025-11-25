import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  AuthResponse,
  Flight,
  FlightSearchParams,
  Airport,
  Booking,
  CreateBookingRequest,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
}

export default new ApiService();
