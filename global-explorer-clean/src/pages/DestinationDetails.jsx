import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdStar,
  MdLocationOn,
  MdCloud,
  MdLanguage,
  MdAttachMoney,
  MdHotel,
  MdLocalActivity,
  MdAddCircle,
} from 'react-icons/md';
import { destinations, hotels, activities } from '../data/destinations';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const destination = destinations.find((d) => d.id === parseInt(id));
  const destinationHotels = hotels.filter((h) => h.destinationId === parseInt(id));
  const destinationActivities = activities.filter((a) => a.destinationId === parseInt(id));

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Destination not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const addToItinerary = () => {
    toast.success(`${destination.name} added to your itinerary!`);
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
            <span className="font-semibold">Back to Destinations</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Destination Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative h-96">
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
              <div className="flex items-center gap-2 text-lg">
                <MdLocationOn />
                <span>{destination.country}, {destination.continent}</span>
              </div>
            </div>
          </div>
          <div className="p-6 flex justify-between items-center border-t">
            <div className="flex gap-8">
              <div>
                <div className="text-sm text-gray-600">Rating</div>
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <MdStar className="text-yellow-500" />
                  {destination.rating}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg. Cost</div>
                <div className="text-lg font-semibold text-blue-600">${destination.averageCost}/day</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Reviews</div>
                <div className="text-lg font-semibold">{destination.reviews.toLocaleString()}</div>
              </div>
            </div>
            <button
              onClick={addToItinerary}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <MdAddCircle size={20} />
              Add to Itinerary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{destination.description}</p>
            </div>

            {/* Top Attractions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Attractions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {destination.topAttractions.map((attraction, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <MdLocationOn className="text-blue-600 text-xl mt-0.5" />
                    <span className="text-gray-900">{attraction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            {destinationActivities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MdLocalActivity className="text-blue-600" />
                  Popular Activities
                </h2>
                <div className="space-y-4">
                  {destinationActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{activity.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>⏱️ {activity.duration}</span>
                            <span className="flex items-center gap-1">
                              <MdStar className="text-yellow-500" />
                              {activity.rating}
                            </span>
                            <span>{activity.reviews.toLocaleString()} reviews</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600">${activity.price}</div>
                          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {destinationHotels.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MdHotel className="text-blue-600" />
                  Hotels in {destination.name}
                </h2>
                <div className="space-y-4">
                  {destinationHotels.slice(0, 3).map((hotel) => (
                    <div
                      key={hotel.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex gap-4">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-32 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{hotel.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-sm">
                              <MdStar className="text-yellow-500" />
                              <span className="font-semibold">{hotel.rating}</span>
                              <span className="text-gray-500">({hotel.reviews} reviews)</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{hotel.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">${hotel.price}</div>
                          <div className="text-sm text-gray-500">per night</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/hotels')}
                  className="mt-4 w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  View All Hotels
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                    <MdLanguage />
                    <span className="font-semibold">Languages</span>
                  </div>
                  <div className="text-gray-900">{destination.languages.join(', ')}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                    <MdAttachMoney />
                    <span className="font-semibold">Currency</span>
                  </div>
                  <div className="text-gray-900">{destination.currency}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                    <MdCloud />
                    <span className="font-semibold">Weather</span>
                  </div>
                  <div className="text-gray-900">{destination.weatherInfo}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                    <MdStar />
                    <span className="font-semibold">Best Time to Visit</span>
                  </div>
                  <div className="text-gray-900">{destination.bestTimeToVisit}</div>
                </div>
              </div>
            </div>

            {/* Popular Activities Tags */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What to Do</h3>
              <div className="flex flex-wrap gap-2">
                {destination.popularActivities.map((activity) => (
                  <span
                    key={activity}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
