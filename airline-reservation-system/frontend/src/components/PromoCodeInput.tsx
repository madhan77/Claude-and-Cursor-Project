import { useState } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface PromoCodeInputProps {
  bookingAmount: number;
  onPromoApplied: (discount: number, promoCodeId: string, code: string) => void;
  airlineCode?: string;
  routeCode?: string;
  classType?: string;
}

export default function PromoCodeInput({
  bookingAmount,
  onPromoApplied,
  airlineCode,
  routeCode,
  classType
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [showPromoCodes, setShowPromoCodes] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);

  const loadAvailablePromos = async () => {
    try {
      const promos = await apiService.getActivePromoCodes();
      setAvailablePromos(promos);
      setShowPromoCodes(true);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    }
  };

  const validatePromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setValidating(true);
    try {
      const result = await apiService.validatePromoCode(
        promoCode.trim().toUpperCase(),
        bookingAmount,
        routeCode,
        classType,
        airlineCode
      );

      if (result.success) {
        const discount = parseFloat(result.calculation.discountAmount);
        setAppliedPromo(result);
        onPromoApplied(discount, result.promoCode.id, result.promoCode.code);
        toast.success(`Promo code applied! You saved $${discount.toFixed(2)}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setAppliedPromo(null);
    } finally {
      setValidating(false);
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    onPromoApplied(0, '', '');
    toast.success('Promo code removed');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Promo Code</h3>
        <button
          type="button"
          onClick={loadAvailablePromos}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View Available Codes
        </button>
      </div>

      {showPromoCodes && availablePromos.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Available Promo Codes:</h4>
          <div className="space-y-2">
            {availablePromos.map((promo) => (
              <div key={promo.code} className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setPromoCode(promo.code);
                    setShowPromoCodes(false);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {promo.code}
                </button>
                {' - '}
                <span className="text-gray-600">{promo.description}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPromoCodes(false)}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2"
          >
            Close
          </button>
        </div>
      )}

      {!appliedPromo ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="input flex-1"
            disabled={validating}
          />
          <button
            type="button"
            onClick={validatePromo}
            disabled={validating || !promoCode.trim()}
            className="btn-primary px-6"
          >
            {validating ? 'Validating...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-semibold">{appliedPromo.promoCode.code}</span>
                <span className="text-green-600">✓</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{appliedPromo.promoCode.description}</p>
              <p className="text-lg font-bold text-green-700 mt-2">
                Discount: ${appliedPromo.calculation.discountAmount}
              </p>
              <p className="text-sm text-gray-600">
                Final Amount: ${appliedPromo.calculation.finalAmount}
              </p>
            </div>
            <button
              type="button"
              onClick={removePromo}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
