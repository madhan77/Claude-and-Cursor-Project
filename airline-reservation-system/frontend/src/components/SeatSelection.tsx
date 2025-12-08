import { useState, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface SeatSelectionProps {
  flightId: string;
  passengerId: string;
  bookingId: string;
  passengerName: string;
  onSeatSelected: (seatNumber: string, extraCharge: number) => void;
}

export default function SeatSelection({
  flightId,
  passengerId,
  bookingId,
  passengerName,
  onSeatSelected
}: SeatSelectionProps) {
  const [seatMap, setSeatMap] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flightInfo, setFlightInfo] = useState<any>(null);

  useEffect(() => {
    loadSeatMap();
  }, [flightId]);

  const loadSeatMap = async () => {
    setLoading(true);
    try {
      const result = await apiService.getFlightSeatMap(flightId);
      setSeatMap(result.seatMap || []);
      setFlightInfo(result.flight);
    } catch (error: any) {
      toast.error('Failed to load seat map');
      console.error('Seat map error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat: any) => {
    if (seat.is_selected && seat.passenger_id !== passengerId) {
      toast.error('Seat already taken');
      return;
    }

    if (!seat.is_available_for_selection) {
      toast.error('Seat not available for selection');
      return;
    }

    try {
      await apiService.selectSeat(bookingId, passengerId, flightId, seat.seat_number);
      setSelectedSeat(seat);
      onSeatSelected(seat.seat_number, parseFloat(seat.extra_price || 0));
      toast.success(`Seat ${seat.seat_number} selected for ${passengerName}`);
      await loadSeatMap(); // Refresh to show updated availability
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to select seat');
    }
  };

  // Group seats by row
  const seatsByRow = seatMap.reduce((acc: any, seat: any) => {
    if (!acc[seat.row_number]) acc[seat.row_number] = [];
    acc[seat.row_number].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">Loading seat map...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">
        Select Seat for {passengerName}
      </h3>
      {flightInfo && (
        <p className="text-sm text-gray-600 mb-4">
          Flight {flightInfo.flight_number} - {flightInfo.aircraft_model}
        </p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded border border-gray-300"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <span>Your Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-300 rounded"></div>
          <span>Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
          <span>Premium (+$)</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="text-center text-sm text-gray-500 mb-2">← Front of Aircraft →</div>
          {sortedRows.map((row) => {
            const seats = seatsByRow[row].sort((a: any, b: any) =>
              a.column_letter.localeCompare(b.column_letter)
            );

            return (
              <div key={row} className="flex gap-1 mb-1 justify-center">
                <div className="w-8 text-sm text-gray-500 flex items-center justify-end pr-2">
                  {row}
                </div>
                {seats.map((seat: any) => {
                  const isSelected = selectedSeat?.seat_number === seat.seat_number;
                  const isTaken = seat.is_selected && seat.passenger_id !== passengerId;
                  const isPremium = parseFloat(seat.extra_price || 0) > 0;
                  const isMyOtherSeat = seat.is_selected && seat.passenger_id === passengerId;

                  // Add aisle gap after C column
                  const needsGap = seat.column_letter === 'C';

                  return (
                    <>
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        disabled={isTaken || !seat.is_available_for_selection}
                        className={`
                          w-9 h-9 sm:w-10 sm:h-10 rounded text-xs font-medium transition-all
                          ${isTaken ? 'bg-red-300 cursor-not-allowed text-gray-600' :
                            isSelected || isMyOtherSeat ? 'bg-blue-500 text-white' :
                            isPremium ? 'bg-yellow-200 border-2 border-yellow-500 hover:bg-yellow-300' :
                            'bg-gray-200 border border-gray-300 hover:bg-gray-300'}
                          ${!seat.is_available_for_selection && !isTaken ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title={`${seat.seat_number} - ${seat.type}${isPremium ? ` (+$${seat.extra_price})` : ''}`}
                      >
                        {seat.seat_number}
                      </button>
                      {needsGap && <div className="w-4"></div>}
                    </>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selectedSeat && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                Selected: {selectedSeat.seat_number}
              </p>
              <p className="text-sm text-gray-600">
                Type: {selectedSeat.type.replace('_', ' ')} • Class: {selectedSeat.class}
              </p>
              {parseFloat(selectedSeat.extra_price) > 0 && (
                <p className="text-sm font-medium text-blue-700 mt-1">
                  Extra charge: ${parseFloat(selectedSeat.extra_price).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {seatMap.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No seat map available for this flight.</p>
          <p className="text-sm mt-2">Seats will be assigned at check-in.</p>
        </div>
      )}
    </div>
  );
}
