import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import apiService from '../services/api';
import type { Booking } from '../types';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      if (!bookingId) return;
      const data = await apiService.getBooking(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your booking has been successfully confirmed.</p>
        </div>

        {/* Booking Details */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Booking Reference</p>
              <p className="font-bold text-lg">{booking.pnr}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Status</p>
              <p className="font-semibold text-green-600 capitalize">{booking.status}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Booking Date</p>
              <p className="font-medium">{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Total Amount</p>
              <p className="font-bold text-lg">${booking.total_price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Passengers */}
        {booking.passengers && booking.passengers.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Passengers</h2>
            <div className="space-y-2">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{passenger.first_name} {passenger.last_name}</span>
                  <span className="text-gray-600 capitalize">{passenger.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• A confirmation email has been sent to your registered email address</li>
            <li>• You can check-in online 24 hours before departure</li>
            <li>• Please arrive at the airport at least 2 hours before departure</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link to="/my-bookings" className="btn-primary flex-1 text-center">
            View My Bookings
          </Link>
          <Link to="/" className="btn-secondary flex-1 text-center">
            Book Another Flight
          </Link>
        </div>
      </div>
    </div>
  );
}
