import { useState, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface MealSelectionProps {
  bookingId: string;
  passengerId: string;
  passengerName: string;
  flightId: string;
  airlineCode?: string;
  onMealAdded: (totalCost: number) => void;
}

export default function MealSelection({
  bookingId,
  passengerId,
  passengerName,
  flightId,
  airlineCode,
  onMealAdded
}: MealSelectionProps) {
  const [mealOptions, setMealOptions] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealOptions();
  }, [airlineCode, dietaryFilter]);

  const loadMealOptions = async () => {
    setLoading(true);
    try {
      const options = await apiService.getMealOptions(airlineCode, dietaryFilter || undefined);
      setMealOptions(options || []);
    } catch (error) {
      console.error('Error loading meal options:', error);
      toast.error('Failed to load meal options');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeal = async (meal: any) => {
    try {
      await apiService.addMeal(
        bookingId,
        passengerId,
        flightId,
        meal.id,
        1,
        specialRequests || undefined
      );

      setSelectedMeal(meal);
      onMealAdded(parseFloat(meal.price || 0));
      toast.success(`Meal "${meal.meal_name}" added for ${passengerName}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add meal');
    }
  };

  const dietaryTypes = [
    { value: '', label: 'All Meals' },
    { value: 'standard', label: 'Standard' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'gluten_free', label: 'Gluten-Free' },
    { value: 'hindu', label: 'Hindu' }
  ];

  const getMealIcon = (dietaryType: string) => {
    const icons: Record<string, string> = {
      standard: '🍽️',
      vegetarian: '🥗',
      vegan: '🌱',
      halal: '🕌',
      kosher: '✡️',
      gluten_free: '🌾',
      hindu: '🕉️'
    };
    return icons[dietaryType] || '🍴';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-4">Loading meal options...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Select Meal for {passengerName}</h3>
      <p className="text-sm text-gray-600 mb-4">Choose your preferred in-flight meal</p>

      {/* Dietary Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter by Dietary Preference:</label>
        <select
          value={dietaryFilter}
          onChange={(e) => setDietaryFilter(e.target.value)}
          className="input"
        >
          {dietaryTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Meal Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {mealOptions.map((meal) => {
          const isSelected = selectedMeal?.id === meal.id;
          const price = parseFloat(meal.price || 0);

          return (
            <div
              key={meal.id}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
              `}
              onClick={() => !isSelected && handleSelectMeal(meal)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{getMealIcon(meal.dietary_type)}</span>
                <div className="flex-1">
                  <h4 className="font-medium">{meal.meal_name}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {meal.meal_code}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{meal.description}</p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {meal.dietary_type.replace('_', ' ')}
                    </span>
                    {price > 0 && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                        +${price.toFixed(2)}
                      </span>
                    )}
                    {price === 0 && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                        Included
                      </span>
                    )}
                  </div>

                  {meal.allergen_info && (
                    <p className="text-xs text-orange-600">
                      ⚠️ {meal.allergen_info}
                    </p>
                  )}

                  {isSelected && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Requests */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Special Dietary Requests (Optional):
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="E.g., No nuts, extra vegetables, etc."
          className="input h-20 resize-none"
        />
      </div>

      {selectedMeal && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="font-medium">
              {selectedMeal.meal_name} selected
            </span>
          </div>
          {parseFloat(selectedMeal.price) > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Additional cost: ${parseFloat(selectedMeal.price).toFixed(2)}
            </p>
          )}
        </div>
      )}

      {mealOptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No meal options available for selected filters</p>
        </div>
      )}
    </div>
  );
}
