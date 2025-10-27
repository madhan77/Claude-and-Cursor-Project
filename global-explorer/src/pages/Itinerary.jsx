import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdCalendarToday,
  MdFlightTakeoff,
  MdHotel,
  MdLocalActivity,
  MdDelete,
  MdAdd,
  MdDownload,
} from 'react-icons/md';

const Itinerary = () => {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('My Amazing Trip');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock itinerary items
  const [itineraryItems, setItineraryItems] = useState([
    {
      id: 1,
      type: 'flight',
      title: 'Flight to Paris',
      date: '2024-06-15',
      time: '10:00 AM',
      details: 'Air France - CDG Airport',
      cost: 450,
    },
    {
      id: 2,
      type: 'hotel',
      title: 'Le Grand Paris Hotel',
      date: '2024-06-15',
      time: '3:00 PM Check-in',
      details: '5 nights - City Center',
      cost: 1250,
    },
    {
      id: 3,
      type: 'activity',
      title: 'Eiffel Tower Tour',
      date: '2024-06-16',
      time: '9:00 AM',
      details: 'Skip-the-line guided tour',
      cost: 45,
    },
    {
      id: 4,
      type: 'activity',
      title: 'Seine River Cruise',
      date: '2024-06-16',
      time: '7:00 PM',
      details: 'Dinner cruise with live music',
      cost: 85,
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'flight':
        return <MdFlightTakeoff className="text-blue-600 text-xl" />;
      case 'hotel':
        return <MdHotel className="text-green-600 text-xl" />;
      case 'activity':
        return <MdLocalActivity className="text-purple-600 text-xl" />;
      default:
        return <MdCalendarToday className="text-gray-600 text-xl" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'flight':
        return 'bg-blue-50 border-blue-200';
      case 'hotel':
        return 'bg-green-50 border-green-200';
      case 'activity':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const deleteItem = (id) => {
    setItineraryItems(itineraryItems.filter((item) => item.id !== id));
    toast.success('Item removed from itinerary');
  };

  const totalCost = itineraryItems.reduce((sum, item) => sum + item.cost, 0);

  const exportItinerary = () => {
    toast.success('Itinerary exported to PDF!');
  };

  // Group items by date
  const groupedItems = itineraryItems.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Itinerary</h1>
          <p className="text-gray-600">Plan and organize your perfect trip</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <MdAdd size={20} />
                  Add Items
                </button>
              </div>

              {Object.keys(groupedItems).length === 0 ? (
                <div className="text-center py-12">
                  <MdCalendarToday className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No items in your itinerary</h3>
                  <p className="text-gray-500 mb-4">Start planning by adding destinations and activities</p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Browse Destinations
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems)
                    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                    .map(([date, items]) => (
                      <div key={date}>
                        <div className="flex items-center gap-3 mb-4">
                          <MdCalendarToday className="text-blue-600 text-xl" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`border rounded-lg p-4 ${getTypeColor(item.type)}`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="mt-1">{getIcon(item.type)}</div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{item.details}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>⏰ {item.time}</span>
                                    <span className="font-semibold text-blue-600">${item.cost}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="text-red-500 hover:text-red-700 transition"
                                >
                                  <MdDelete size={20} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trip Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdFlightTakeoff />
                    <span>Flights</span>
                  </div>
                  <span className="font-semibold">
                    {itineraryItems.filter((i) => i.type === 'flight').length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdHotel />
                    <span>Hotels</span>
                  </div>
                  <span className="font-semibold">
                    {itineraryItems.filter((i) => i.type === 'hotel').length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdLocalActivity />
                    <span>Activities</span>
                  </div>
                  <span className="font-semibold">
                    {itineraryItems.filter((i) => i.type === 'activity').length}
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Cost</span>
                    <span className="text-2xl font-bold text-blue-600">${totalCost}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={exportItinerary}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <MdDownload size={20} />
                  Export to PDF
                </button>
                <button
                  onClick={() => toast.info('Share feature coming soon!')}
                  className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                >
                  Share Itinerary
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Planning Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Book flights 6-8 weeks in advance for best prices</li>
                <li>• Reserve popular activities early to avoid sold-out dates</li>
                <li>• Leave buffer time between activities for travel</li>
                <li>• Check visa requirements well in advance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
