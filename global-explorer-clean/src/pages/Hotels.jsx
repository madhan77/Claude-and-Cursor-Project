import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdStar,
  MdLocationOn,
  MdWifi,
  MdPool,
  MdSpa,
  MdRestaurant,
  MdFitnessCenter,
} from 'react-icons/md';
import { hotels, destinations } from '../data/destinations';

const Hotels = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDestinationId = location.state?.destinationId;

  const [selectedDestination, setSelectedDestination] = useState(initialDestinationId || 'all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');

  const amenityIcons = {
    WiFi: <MdWifi />,
    Pool: <MdPool />,
    Spa: <MdSpa />,
    Restaurant: <MdRestaurant />,
    Gym: <MdFitnessCenter />,
  };

  // Filter and sort hotels
  const filteredHotels = hotels
    .filter((hotel) => {
      const matchesDestination = selectedDestination === 'all' || hotel.destinationId === parseInt(selectedDestination);
      const matchesPrice = hotel.price >= minPrice && hotel.price <= maxPrice;
      const matchesRating = hotel.rating >= minRating;
      return matchesDestination && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const bookHotel = (hotel) => {
    toast.success(`${hotel.name} added to your booking!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
          >
            <MdArrowBack size={24} />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Stay</h1>
          <p className="text-gray-600">Browse and compare hotels across all destinations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

              <div className="space-y-6">
                {/* Destination Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Destinations</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range (per night)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      ${minPrice} - ${maxPrice}
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3.5}>3.5+ Stars</option>
                    <option value={4.0}>4.0+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Hotels List */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-600">
              Found <span className="font-semibold text-blue-600">{filteredHotels.length}</span> hotels
            </div>

            <div className="space-y-6">
              {filteredHotels.map((hotel) => {
                const destination = destinations.find((d) => d.id === hotel.destinationId);
                return (
                  <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row">
                      {/* Hotel Image */}
                      <div className="md:w-1/3">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-64 md:h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
                          }}
                        />
                      </div>

                      {/* Hotel Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <MdLocationOn className="text-blue-600" />
                              <span>{hotel.location}, {destination?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                {[...Array(hotel.stars)].map((_, i) => (
                                  <MdStar key={i} className="text-yellow-500" />
                                ))}
                              </div>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1 text-sm">
                                <span className="font-semibold">{hotel.rating}</span>
                                <span className="text-gray-500">({hotel.reviews.toLocaleString()} reviews)</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <div className="text-sm text-gray-500 mb-1">From</div>
                            <div className="text-3xl font-bold text-blue-600">${hotel.price}</div>
                            <div className="text-sm text-gray-500">per night</div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities.slice(0, 6).map((amenity) => (
                              <div
                                key={amenity}
                                className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                              >
                                <span className="text-blue-600">
                                  {amenityIcons[amenity] || <MdRestaurant />}
                                </span>
                                {amenity}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => bookHotel(hotel)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => navigate(`/destination/${destination.id}`)}
                            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                          >
                            View Destination
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredHotels.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <MdLocationOn className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hotels found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
