import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useBookingStore } from '../store/bookingStore';
import type { Flight } from '../types';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addFlight } = useBookingStore();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    searchFlights();
  }, [searchParams]);

  const searchFlights = async () => {
    try {
      setLoading(true);
      const params = {
        departure_airport: searchParams.get('departure_airport') || '',
        arrival_airport: searchParams.get('arrival_airport') || '',
        departure_date: searchParams.get('departure_date') || '',
        adults: parseInt(searchParams.get('adults') || '1'),
        children: parseInt(searchParams.get('children') || '0'),
        infants: parseInt(searchParams.get('infants') || '0'),
        class: searchParams.get('class') as any || 'economy',
      };

      const results = await apiService.searchFlights(params);
      setFlights(results);
    } catch (error: any) {
      toast.error('Failed to search flights');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight: Flight) => {
    addFlight(flight);
    navigate(`/book/${flight.id}`);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') {
      return (a.price.economy || 0) - (b.price.economy || 0);
    } else if (sortBy === 'duration') {
      return a.duration - b.duration;
    } else if (sortBy === 'departure') {
      return new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime();
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Flights</h1>
          <p className="text-gray-600">
            {searchParams.get('departure_airport')} → {searchParams.get('arrival_airport')} •
            {format(new Date(searchParams.get('departure_date') || ''), 'MMM dd, yyyy')}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {flights.length} flight{flights.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-sm py-1.5"
              >
                <option value="price">Price (Low to High)</option>
                <option value="duration">Duration</option>
                <option value="departure">Departure Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flight Results */}
        {flights.length === 0 ? (
          <div className="card text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFlights.map((flight) => (
              <div
                key={flight.id}
                className="flight-card"
                onClick={() => handleSelectFlight(flight)}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Flight Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="font-semibold text-gray-900">
                        {flight.airline.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {flight.flight_number}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      {/* Departure */}
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {format(new Date(flight.departure.time), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {flight.departure.city} ({flight.departure.airport})
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                          {formatDuration(flight.duration)}
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="flex-1 border-t border-gray-300"></div>
                          <svg
                            className="h-5 w-5 text-gray-400 mx-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                          <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {flight.aircraft}
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {format(new Date(flight.arrival.time), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {flight.arrival.city} ({flight.arrival.airport})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price and Button */}
                  <div className="ml-8 text-right">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {formatPrice(flight.price.economy)}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">per person</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFlight(flight);
                      }}
                      className="btn-primary"
                    >
                      Select Flight
                    </button>
                    <div className="text-xs text-gray-500 mt-2">
                      {flight.available_seats.economy} seats left
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
