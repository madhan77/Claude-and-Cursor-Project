import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import type { Passenger } from '../types';

export default function BookingFlow() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedFlights, setPassengers, setContactInfo } = useBookingStore();

  const [submitting, setSubmitting] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');

  // Redirect if no flights selected
  useEffect(() => {
    if (selectedFlights.length === 0) {
      toast.error('No flights selected. Please select flights first.');
      navigate('/');
    }
  }, [selectedFlights, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFlights.length === 0) return;

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
        flights: selectedFlights.map(f => f.id),
        passengers: passengerData,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        payment_method: 'credit_card',
      };

      const booking = await apiService.createBooking(bookingData);
      console.log('Booking created:', booking);
      toast.success('Booking created successfully!');
      // Navigate first, then clear booking on the confirmation page
      const bookingId = booking.pnr || (booking as any).booking_id || booking.id;
      console.log('Navigating to booking confirmation with ID:', bookingId);
      navigate(`/booking-confirmation/${bookingId}`, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flight Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Flight Details</h2>
            <div className="space-y-4">
              {selectedFlights.map((flight, index) => (
                <div key={flight.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <p className="font-medium text-primary-600 mb-2">
                    {selectedFlights.length > 1 ? (index === 0 ? 'Outbound Flight' : 'Return Flight') : 'Flight'}
                  </p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Flight:</span> {flight.airline.name} {flight.flight_number}</p>
                    <p><span className="font-medium">Route:</span> {flight.departure.city} → {flight.arrival.city}</p>
                    <p><span className="font-medium">Departure:</span> {new Date(flight.departure.time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p><span className="font-medium">Price:</span> ${Number(flight.price.economy || 0).toFixed(2)} per person</p>
                  </div>
                </div>
              ))}
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
                ${(selectedFlights.reduce((sum, flight) => sum + Number(flight.price.economy || 0), 0) * passengerCount).toFixed(2)}
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
