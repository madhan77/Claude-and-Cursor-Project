import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdPerson,
  MdEmail,
  MdNotifications,
  MdLanguage,
  MdAttachMoney,
  MdSecurity,
  MdTravelExplore,
} from 'react-icons/md';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    currency: 'USD',
    language: 'English',
    budgetRange: 'medium',
    travelStyle: 'leisure',
  });

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully!');
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <MdPerson className="text-blue-600 text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {currentUser?.displayName || 'Traveler'}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MdEmail />
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={currentUser?.displayName || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <input
                type="text"
                value={currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdTravelExplore className="text-blue-600" />
            Travel Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Style
              </label>
              <select
                value={preferences.travelStyle}
                onChange={(e) =>
                  setPreferences({ ...preferences, travelStyle: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="leisure">Leisure</option>
                <option value="adventure">Adventure</option>
                <option value="luxury">Luxury</option>
                <option value="budget">Budget</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range (per day)
              </label>
              <select
                value={preferences.budgetRange}
                onChange={(e) =>
                  setPreferences({ ...preferences, budgetRange: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="budget">Budget ($50-100)</option>
                <option value="medium">Medium ($100-250)</option>
                <option value="luxury">Luxury ($250+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdLanguage className="text-blue-600" />
            Regional Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) =>
                  setPreferences({ ...preferences, currency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdNotifications className="text-blue-600" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive updates about your trips and bookings
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  Get real-time alerts on your device
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      pushNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdSecurity className="text-blue-600" />
            Privacy & Security
          </h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-left">
              Change Password
            </button>
            <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-left">
              Two-Factor Authentication
            </button>
            <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-left">
              Privacy Settings
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSavePreferences}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Save Preferences
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
