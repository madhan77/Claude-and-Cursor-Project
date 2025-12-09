import { useState, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface BaggageSelectionProps {
  bookingId: string;
  passengerId: string;
  passengerName: string;
  airlineCode?: string;
  onBaggageAdded: (totalCost: number) => void;
}

export default function BaggageSelection({
  bookingId,
  passengerId,
  passengerName,
  airlineCode,
  onBaggageAdded
}: BaggageSelectionProps) {
  const [baggageOptions, setBaggageOptions] = useState<any[]>([]);
  const [selectedBaggage, setSelectedBaggage] = useState<Map<string, { option: any; quantity: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBaggageOptions();
  }, [airlineCode]);

  const loadBaggageOptions = async () => {
    setLoading(true);
    try {
      const options = await apiService.getBaggageOptions(airlineCode);
      setBaggageOptions(options || []);
    } catch (error) {
      console.error('Error loading baggage options:', error);
      toast.error('Failed to load baggage options');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (optionId: string, option: any, quantity: number) => {
    const newSelected = new Map(selectedBaggage);

    if (quantity > 0) {
      newSelected.set(optionId, { option, quantity });
    } else {
      newSelected.delete(optionId);
    }

    setSelectedBaggage(newSelected);
  };

  const calculateTotal = () => {
    let total = 0;
    selectedBaggage.forEach(({ option, quantity }) => {
      total += parseFloat(option.price) * quantity;
    });
    return total;
  };

  const handleAddBaggage = async () => {
    if (selectedBaggage.size === 0) {
      toast.error('Please select at least one baggage option');
      return;
    }

    try {
      const promises = Array.from(selectedBaggage.values()).map(({ option, quantity }) =>
        apiService.addBaggage(bookingId, passengerId, option.id, quantity)
      );

      await Promise.all(promises);
      const total = calculateTotal();
      onBaggageAdded(total);
      toast.success('Baggage added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add baggage');
    }
  };

  const getBaggageIcon = (type: string) => {
    const icons: Record<string, string> = {
      carry_on: '🎒',
      checked: '🧳',
      oversized: '📦',
      sports_equipment: '⛷️',
      pet: '🐕'
    };
    return icons[type] || '💼';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-4">Loading baggage options...</div>
      </div>
    );
  }

  // Group by baggage type
  const groupedOptions = baggageOptions.reduce((acc: any, option: any) => {
    if (!acc[option.baggage_type]) acc[option.baggage_type] = [];
    acc[option.baggage_type].push(option);
    return acc;
  }, {});

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Add Baggage for {passengerName}</h3>
      <p className="text-sm text-gray-600 mb-4">Select additional baggage options</p>

      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([type, options]: [string, any]) => (
          <div key={type} className="border rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span className="text-2xl">{getBaggageIcon(type)}</span>
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </h4>

            <div className="space-y-3">
              {options.map((option: any) => {
                const selected = selectedBaggage.get(option.id);
                const quantity = selected?.quantity || 0;

                return (
                  <div key={option.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.description}</p>
                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                          {option.weight_limit && (
                            <p>Weight: Up to {option.weight_limit}kg</p>
                          )}
                          {option.dimension_limit && (
                            <p>Dimensions: {option.dimension_limit}</p>
                          )}
                          <p className="font-medium text-primary-600">
                            ${parseFloat(option.price).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm text-gray-600">Quantity:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(option.id, option, Math.max(0, quantity - 1))}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(option.id, option, quantity + 1)}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      {quantity > 0 && (
                        <span className="ml-auto text-sm font-medium text-primary-600">
                          ${(parseFloat(option.price) * quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedBaggage.size > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Total Baggage Cost:</span>
            <span className="text-xl font-bold text-primary-600">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddBaggage}
            className="btn-primary w-full"
          >
            Add Selected Baggage
          </button>
        </div>
      )}

      {baggageOptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No baggage options available</p>
        </div>
      )}
    </div>
  );
}
