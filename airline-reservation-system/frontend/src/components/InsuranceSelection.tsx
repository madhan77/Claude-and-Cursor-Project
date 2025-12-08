import { useState, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface InsuranceSelectionProps {
  bookingId: string;
  passengerId: string;
  passengerName: string;
  departureDate: string;
  returnDate: string;
  onInsuranceAdded: (cost: number) => void;
}

export default function InsuranceSelection({
  bookingId,
  passengerId,
  passengerName,
  departureDate,
  returnDate,
  onInsuranceAdded
}: InsuranceSelectionProps) {
  const [insuranceProducts, setInsuranceProducts] = useState<any[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsuranceProducts();
  }, []);

  const loadInsuranceProducts = async () => {
    setLoading(true);
    try {
      const products = await apiService.getInsuranceProducts();
      setInsuranceProducts(products || []);
    } catch (error) {
      console.error('Error loading insurance products:', error);
      toast.error('Failed to load insurance options');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInsurance = async (product: any) => {
    try {
      await apiService.addInsurance(
        bookingId,
        passengerId,
        product.id,
        departureDate,
        returnDate
      );

      setSelectedInsurance(product);
      onInsuranceAdded(parseFloat(product.price));
      toast.success(`${product.product_name} added for ${passengerName}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add insurance');
    }
  };

  const formatCoverage = (coverage: any) => {
    if (!coverage) return [];

    const coverageItems = [];
    if (coverage.trip_cancellation) {
      coverageItems.push({ label: 'Trip Cancellation', amount: coverage.trip_cancellation });
    }
    if (coverage.medical) {
      coverageItems.push({ label: 'Medical Emergency', amount: coverage.medical });
    }
    if (coverage.baggage_loss) {
      coverageItems.push({ label: 'Baggage Loss', amount: coverage.baggage_loss });
    }
    if (coverage.travel_delay) {
      coverageItems.push({ label: 'Travel Delay', amount: coverage.travel_delay });
    }
    if (coverage.flight_accident) {
      coverageItems.push({ label: 'Flight Accident', amount: coverage.flight_accident });
    }
    if (coverage.emergency_evacuation) {
      coverageItems.push({ label: 'Emergency Evacuation', amount: coverage.emergency_evacuation });
    }

    return coverageItems;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-4">Loading insurance options...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Travel Insurance for {passengerName}</h3>
      <p className="text-sm text-gray-600 mb-6">Protect your trip with comprehensive coverage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insuranceProducts.map((product, index) => {
          const isSelected = selectedInsurance?.id === product.id;
          const price = parseFloat(product.price);
          const coverageAmount = parseFloat(product.coverage_amount);
          const coverageDetails = formatCoverage(product.coverage_details);

          const tierColors = ['gray', 'blue', 'purple'];
          const color = tierColors[index] || 'gray';

          return (
            <div
              key={product.id}
              className={`
                border-2 rounded-lg p-5 transition-all cursor-pointer
                ${isSelected
                  ? `border-${color}-500 bg-${color}-50 shadow-lg scale-105`
                  : `border-gray-200 hover:border-${color}-300 hover:shadow-md`
                }
              `}
              onClick={() => !isSelected && handleSelectInsurance(product)}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h4 className={`text-lg font-bold text-${color}-700 mb-1`}>
                  {product.product_name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className={`text-3xl font-bold text-${color}-600`}>
                  ${price.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">per person</p>
              </div>

              {/* Coverage Amount */}
              <div className={`bg-${color}-100 rounded-lg p-3 mb-4 text-center`}>
                <p className="text-xs text-gray-600 mb-1">Total Coverage</p>
                <p className={`text-xl font-bold text-${color}-700`}>
                  ${coverageAmount.toLocaleString()}
                </p>
              </div>

              {/* Coverage Details */}
              <div className="space-y-2 mb-4">
                {coverageDetails.map((item, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <span className={`text-${color}-500 mr-2`}>✓</span>
                    <span className="flex-1">{item.label}</span>
                    <span className="font-medium text-gray-700">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              {isSelected ? (
                <div className={`bg-${color}-500 text-white text-center py-2 rounded font-medium`}>
                  ✓ Selected
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectInsurance(product)}
                  className={`w-full bg-${color}-600 hover:bg-${color}-700 text-white py-2 rounded font-medium transition-colors`}
                >
                  Select Plan
                </button>
              )}

              {product.terms_url && (
                <a
                  href={product.terms_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-center text-gray-500 hover:text-gray-700 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Terms & Conditions
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Skip Insurance Option */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setSelectedInsurance(null);
            onInsuranceAdded(0);
            toast.success('Continuing without insurance');
          }}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Skip insurance (not recommended)
        </button>
      </div>

      {insuranceProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No insurance products available</p>
        </div>
      )}
    </div>
  );
}
