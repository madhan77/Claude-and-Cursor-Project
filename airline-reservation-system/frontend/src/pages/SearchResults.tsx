import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useBookingStore } from '../store/bookingStore';
import type { Flight } from '../types';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addFlight } = useBookingStore();

  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);

  const isRoundTrip = !!searchParams.get('return_date');

  useEffect(() => {
    searchFlights();
  }, [searchParams]);

  const searchFlights = async () => {
    try {
      setLoading(true);

      const baseParams = {
        adults: parseInt(searchParams.get('adults') || '1'),
        children: parseInt(searchParams.get('children') || '0'),
        infants: parseInt(searchParams.get('infants') || '0'),
        class: searchParams.get('class') as any || 'economy',
      };

      // Search outbound flights
      const outboundParams = {
        ...baseParams,
        departure_airport: searchParams.get('departure_airport') || '',
        arrival_airport: searchParams.get('arrival_airport') || '',
        departure_date: searchParams.get('departure_date') || '',
      };

      const outboundResults = await apiService.searchFlights(outboundParams);
      setOutboundFlights(outboundResults);

      // Search return flights if round-trip
      if (isRoundTrip) {
        const returnParams = {
          ...baseParams,
          departure_airport: searchParams.get('arrival_airport') || '', // Swap airports
          arrival_airport: searchParams.get('departure_airport') || '',
          departure_date: searchParams.get('return_date') || '',
        };

        const returnResults = await apiService.searchFlights(returnParams);
        setReturnFlights(returnResults);
      }
    } catch (error: any) {
      toast.error('Failed to search flights');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOutbound = (flight: Flight) => {
    if (isRoundTrip) {
      setSelectedOutbound(flight);
      // Scroll to return flights section
      document.getElementById('return-flights')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      addFlight(flight);
      navigate('/book');
    }
  };

  const handleSelectReturn = (flight: Flight) => {
    setSelectedReturn(flight);
  };

  const handleContinueToBooking = () => {
    if (!selectedOutbound || !selectedReturn) {
      toast.error('Please select both outbound and return flights');
      return;
    }

    addFlight(selectedOutbound);
    addFlight(selectedReturn);
    navigate('/book');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price?: number | string) => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    return `$${numPrice.toFixed(2)}`;
  };

  const sortFlights = (flights: Flight[]) => {
    return [...flights].sort((a, b) => {
      if (sortBy === 'price') {
        const priceA = typeof a.price.economy === 'string' ? parseFloat(a.price.economy) : (a.price.economy || 0);
        const priceB = typeof b.price.economy === 'string' ? parseFloat(b.price.economy) : (b.price.economy || 0);
        return priceA - priceB;
      } else if (sortBy === 'duration') {
        return a.duration - b.duration;
      } else if (sortBy === 'departure') {
        return new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime();
      }
      return 0;
    });
  };

  const formatDateFromString = (dateStr: string) => {
    // Parse YYYY-MM-DD format without timezone conversion
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(parsed, 'MMM dd, yyyy');
  };

  const renderFlightList = (flights: Flight[], isReturn: boolean = false) => {
    const sortedFlights = sortFlights(flights);
    const selectedFlight = isReturn ? selectedReturn : selectedOutbound;

    return (
      <div className="space-y-4">
        {sortedFlights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;

          return (
            <div
              key={flight.id}
              className={`flight-card ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''} ${isRoundTrip ? 'cursor-pointer' : ''}`}
              onClick={() => isReturn ? handleSelectReturn(flight) : handleSelectOutbound(flight)}
            >
              <div className="flex items-center justify-between">
                {/* Left: Flight Details */}
                <div className="flex-1">
                  {isSelected && (
                    <div className="mb-2 flex items-center text-primary-600 font-medium text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Selected
                    </div>
                  )}
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
                  {!isRoundTrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOutbound(flight);
                      }}
                      className="btn-primary"
                    >
                      Select Flight
                    </button>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {flight.available_seats.economy} seats left
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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

  const depDate = searchParams.get('departure_date') || '';
  const retDate = searchParams.get('return_date') || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRoundTrip ? 'Round Trip Flights' : 'Available Flights'}
          </h1>
          <p className="text-gray-600">
            {searchParams.get('departure_airport')} → {searchParams.get('arrival_airport')} • {formatDateFromString(depDate)}
            {isRoundTrip && ` • Return: ${formatDateFromString(retDate)}`}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {outboundFlights.length} outbound flight{outboundFlights.length !== 1 ? 's' : ''} found
              {isRoundTrip && ` • ${returnFlights.length} return flight${returnFlights.length !== 1 ? 's' : ''} found`}
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

        {/* Outbound Flights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isRoundTrip ? 'Outbound Flight' : 'Flights'}
          </h2>
          {outboundFlights.length === 0 ? (
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
            renderFlightList(outboundFlights, false)
          )}
        </div>

        {/* Return Flights (Round Trip Only) */}
        {isRoundTrip && (
          <div id="return-flights" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Return Flight
            </h2>
            {!selectedOutbound ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">Please select an outbound flight first</p>
              </div>
            ) : returnFlights.length === 0 ? (
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No return flights found</h3>
                <p className="text-gray-600">Try adjusting your return date</p>
              </div>
            ) : (
              renderFlightList(returnFlights, true)
            )}
          </div>
        )}

        {/* Continue Button (Round Trip Only) */}
        {isRoundTrip && selectedOutbound && selectedReturn && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total for {searchParams.get('adults')} passenger{parseInt(searchParams.get('adults') || '1') > 1 ? 's' : ''}</div>
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(
                    (typeof selectedOutbound.price.economy === 'string' ? parseFloat(selectedOutbound.price.economy) : selectedOutbound.price.economy || 0) +
                    (typeof selectedReturn.price.economy === 'string' ? parseFloat(selectedReturn.price.economy) : selectedReturn.price.economy || 0)
                  )}
                </div>
              </div>
              <button
                onClick={handleContinueToBooking}
                className="btn-primary text-lg px-8 py-3"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
