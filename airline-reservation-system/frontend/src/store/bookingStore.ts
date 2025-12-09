import { create } from 'zustand';
import type { Flight, Passenger } from '../types';

interface BookingState {
  selectedFlights: Flight[];
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  addFlight: (flight: Flight) => void;
  removeFlight: (flightId: string) => void;
  setPassengers: (passengers: Passenger[]) => void;
  setContactInfo: (email: string, phone: string) => void;
  clearBooking: () => void;
  getTotalPrice: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedFlights: [],
  passengers: [],
  contactEmail: '',
  contactPhone: '',
  addFlight: (flight) =>
    set((state) => ({
      selectedFlights: [...state.selectedFlights, flight],
    })),
  removeFlight: (flightId) =>
    set((state) => ({
      selectedFlights: state.selectedFlights.filter((f) => f.id !== flightId),
    })),
  setPassengers: (passengers) => set({ passengers }),
  setContactInfo: (email, phone) =>
    set({ contactEmail: email, contactPhone: phone }),
  clearBooking: () =>
    set({
      selectedFlights: [],
      passengers: [],
      contactEmail: '',
      contactPhone: '',
    }),
  getTotalPrice: () => {
    const state = get();
    let total = 0;
    state.selectedFlights.forEach((flight) => {
      const passengerCount = state.passengers.length || 1;
      total += (flight.price.economy || 0) * passengerCount;
    });
    return total;
  },
}));
