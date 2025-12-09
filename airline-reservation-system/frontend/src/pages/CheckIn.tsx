import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export default function CheckIn() {
  const { pnr: urlPnr } = useParams();
  const navigate = useNavigate();
  const [pnr, setPnr] = useState(urlPnr || '');
  const [booking, setBooking] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [boardingPass, setBoardingPass] = useState<any>(null);

  useEffect(() => {
    if (urlPnr) {
      loadBooking(urlPnr);
    }
  }, [urlPnr]);

  const loadBooking = async (bookingPnr: string) => {
    setLoading(true);
    try {
      const bookingData = await apiService.getBooking(bookingPnr);
      setBooking(bookingData);

      const passengerStatus = await apiService.getCheckinStatus(bookingData.id);
      setPassengers(passengerStatus);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnr.trim()) {
      navigate(`/checkin/${pnr.trim().toUpperCase()}`);
      loadBooking(pnr.trim().toUpperCase());
    }
  };

  const handleCheckIn = async (passenger: any) => {
    const departureTime = new Date(passenger.departure_time);
    const now = new Date();
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture > 24) {
      toast.error('Check-in opens 24 hours before departure');
      return;
    }

    if (hoursUntilDeparture < 1) {
      toast.error('Check-in has closed for this flight');
      return;
    }

    setCheckingIn(true);
    try {
      await apiService.performOnlineCheckin(
        booking.id,
        passenger.passenger_id,
        passenger.flight_id
      );

      toast.success('Check-in successful!');

      // Load boarding pass
      const pass = await apiService.getBoardingPass(passenger.passenger_id, passenger.flight_id);
      setBoardingPass(pass);

      // Reload passenger status
      const passengerStatus = await apiService.getCheckinStatus(booking.id);
      setPassengers(passengerStatus);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const viewBoardingPass = async (passenger: any) => {
    try {
      const pass = await apiService.getBoardingPass(passenger.passenger_id, passenger.flight_id);
      setBoardingPass(pass);
    } catch (error: any) {
      toast.error('Failed to load boarding pass');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Online Check-In</h1>

        {/* PNR Search */}
        {!booking && (
          <div className="card mb-6">
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium mb-2">
                Enter your booking reference (PNR):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  className="input flex-1"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8"
                >
                  {loading ? 'Loading...' : 'Find Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking Details */}
        {booking && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Booking: {booking.pnr}</h2>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{booking.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBooking(null);
                    setPassengers([]);
                    setPnr('');
                    setBoardingPass(null);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  New Search
                </button>
              </div>
            </div>

            {/* Passengers */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Passengers</h3>
              <div className="space-y-4">
                {passengers.map((passenger, index) => {
                  const departureTime = new Date(passenger.departure_time);
                  const now = new Date();
                  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                  const canCheckIn = hoursUntilDeparture <= 24 && hoursUntilDeparture >= 1;

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {passenger.first_name} {passenger.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Flight: {passenger.flight_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Departure: {departureTime.toLocaleString()}
                          </p>
                          {passenger.gate && (
                            <p className="text-sm text-gray-600">
                              Gate: {passenger.gate} • Terminal: {passenger.terminal}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          {passenger.checked_in ? (
                            <>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                ✓ Checked In
                              </span>
                              {passenger.boarding_group && (
                                <span className="text-sm text-gray-600">
                                  Group: {passenger.boarding_group}
                                </span>
                              )}
                              <button
                                onClick={() => viewBoardingPass(passenger)}
                                className="text-sm text-primary-600 hover:text-primary-700"
                              >
                                View Boarding Pass
                              </button>
                            </>
                          ) : canCheckIn ? (
                            <button
                              onClick={() => handleCheckIn(passenger)}
                              disabled={checkingIn}
                              className="btn-primary"
                            >
                              {checkingIn ? 'Checking In...' : 'Check In'}
                            </button>
                          ) : hoursUntilDeparture > 24 ? (
                            <span className="text-sm text-gray-500">
                              Opens {Math.floor(hoursUntilDeparture - 24)}h {Math.floor(((hoursUntilDeparture - 24) % 1) * 60)}m
                            </span>
                          ) : (
                            <span className="text-sm text-red-500">
                              Check-in closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Boarding Pass Modal */}
        {boardingPass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Boarding Pass</h3>
                <button
                  onClick={() => setBoardingPass(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600 mb-2">
                    {boardingPass.flight_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {boardingPass.first_name} {boardingPass.last_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">PNR</p>
                    <p className="font-medium">{boardingPass.pnr}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Seat</p>
                    <p className="font-medium">{boardingPass.seat_number || 'TBA'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gate</p>
                    <p className="font-medium">{boardingPass.gate || 'TBA'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Group</p>
                    <p className="font-medium">{boardingPass.boarding_group}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Boarding Time</p>
                    <p className="font-medium">
                      {new Date(boardingPass.boarding_time).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="bg-white p-4 text-center border-2 border-gray-200 rounded">
                  <div className="font-mono text-xs mb-2">{boardingPass.barcode}</div>
                  <div className="h-24 bg-black bg-opacity-10 flex items-center justify-center">
                    <span className="text-gray-400">Barcode: {boardingPass.boarding_pass_number}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="btn-primary w-full mt-4"
              >
                Print Boarding Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
