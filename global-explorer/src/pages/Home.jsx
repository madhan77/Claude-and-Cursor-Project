import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MdTravelExplore,
  MdLogout,
  MdSearch,
  MdStar,
  MdLocationOn,
  MdHotel,
  MdEvent,
  MdPerson,
} from 'react-icons/md';
import { destinations } from '../data/destinations';

const Home = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const continents = ['All', 'Europe', 'Asia', 'North America', 'Oceania', 'Africa', 'South America'];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Filter and sort destinations
  const filteredDestinations = destinations
    .filter((dest) => {
      const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dest.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContinent = selectedContinent === 'All' || dest.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.averageCost - b.averageCost;
      if (sortBy === 'price-high') return b.averageCost - a.averageCost;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdTravelExplore className="text-blue-600 text-3xl" />
              <h1 className="text-2xl font-bold text-gray-900">Global Explorer</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/hotels')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <MdHotel size={20} />
                <span className="hidden md:inline">Hotels</span>
              </button>
              <button
                onClick={() => navigate('/itinerary')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <MdEvent size={20} />
                <span className="hidden md:inline">Itinerary</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <MdPerson size={20} />
                <span className="hidden md:inline">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <MdLogout size={20} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600 mb-6">Discover amazing destinations around the world</p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destinations..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Continent</label>
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {continents.map((continent) => (
                  <option key={continent} value={continent}>
                    {continent}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{filteredDestinations.length}</span> destinations found
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => navigate(`/destination/${destination.id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition text-left"
            >
              <div className="relative h-48">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
                  }}
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                  <MdStar className="text-yellow-500" />
                  <span className="font-semibold text-sm">{destination.rating}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{destination.name}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MdLocationOn className="text-blue-600" />
                  <span>{destination.country}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-blue-600 font-bold text-lg">
                    ${destination.averageCost}
                    <span className="text-sm text-gray-500 font-normal"> /day</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {destination.reviews.toLocaleString()} reviews
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <MdLocationOn className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No destinations found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedContinent('All');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
