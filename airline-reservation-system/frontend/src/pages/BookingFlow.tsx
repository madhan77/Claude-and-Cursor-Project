import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import type { Flight, Passenger } from '../types';

export default function BookingFlow() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedFlights, passengers, setPassengers, setContactInfo, clearBooking } = useBookingStore();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    loadFlight();
  }, [flightId]);

  const loadFlight = async () => {
    try {
      if (!flightId) return;
      const data = await apiService.getFlightById(flightId);
      setFlight(data);
    } catch (error) {
      toast.error('Failed to load flight details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flight) return;

    // Collect passenger data from form
    const passengerData: Passenger[] = [];
    const form = e.target as HTMLFormElement;

    for (let i = 0; i < passengerCount; i++) {
      passengerData.push({
        type: 'adult',
        first_name: (form[`passenger_${i}_first_name`] as HTMLInputElement).value,
        last_name: (form[`passenger_${i}_last_name`] as HTMLInputElement).value,
        date_of_birth: (form[`passenger_${i}_dob`] as HTMLInputElement).value,
      });
    }

    setPassengers(passengerData);
    setContactInfo(contactEmail, contactPhone);

    setSubmitting(true);

    try {
      const bookingData = {
        flights: [flight.id],
        passengers: passengerData,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        payment_method: 'credit_card',
      };

      const booking = await apiService.createBooking(bookingData);
      toast.success('Booking created successfully!');
      clearBooking();
      navigate(`/booking-confirmation/${booking.pnr || booking.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Flight not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flight Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Flight Details</h2>
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Flight:</span> {flight.airline.name} {flight.flight_number}</p>
              <p><span className="font-medium">Route:</span> {flight.departure.city} → {flight.arrival.city}</p>
              <p><span className="font-medium">Price:</span> ${flight.price.economy} per person</p>
            </div>
          </div>

          {/* Number of Passengers */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Passengers
            </label>
            <input
              type="number"
              min="1"
              max="9"
              value={passengerCount}
              onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
              className="input-field max-w-xs"
            />
          </div>

          {/* Passenger Information */}
          {Array.from({ length: passengerCount }).map((_, index) => (
            <div key={index} className="card">
              <h3 className="text-lg font-semibold mb-4">Passenger {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name={`passenger_${index}_first_name`}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name={`passenger_${index}_last_name`}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name={`passenger_${index}_dob`}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Total Price */}
          <div className="card bg-primary-50 border-2 border-primary-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Price:</span>
              <span className="text-3xl font-bold text-primary-600">
                ${((flight.price.economy || 0) * passengerCount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full text-lg" disabled={submitting}>
            {submitting ? 'Processing...' : 'Complete Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
