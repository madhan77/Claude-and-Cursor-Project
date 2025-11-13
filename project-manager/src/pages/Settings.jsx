import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCog, FaDatabase } from 'react-icons/fa';
import { generateMockData } from '../utils/generateMockData';
import { createDemoData } from '../utils/createDemoData';
import { toast } from 'react-toastify';

export default function Settings() {
  const { currentUser, userProfile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const handleGenerateMockData = async () => {
    if (!window.confirm('This will generate 1950+ mock records in the database. Continue?')) {
      return;
    }

    setIsGenerating(true);
    toast.info('Starting mock data generation... This may take a few minutes.');

    try {
      await generateMockData(currentUser.uid);
      toast.success('Successfully generated mock data! Refresh the page to see the data.');
    } catch (error) {
      console.error('Error generating mock data:', error);
      toast.error('Failed to generate mock data. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateDemoData = async () => {
    if (!window.confirm('This will create demo data for testing Demo Mode. Continue?')) {
      return;
    }

    setIsCreatingDemo(true);
    toast.info('Creating demo data...');

    try {
      await createDemoData();
      toast.success('Demo data created successfully! Try Demo Mode now.');
    } catch (error) {
      console.error('Error creating demo data:', error);
      toast.error('Failed to create demo data. Check console for details.');
    } finally {
      setIsCreatingDemo(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-lg">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-sm text-gray-600">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userProfile?.displayName || ''}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about your projects</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications for task updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaDatabase className="text-yellow-600" />
            Developer Tools
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Warning:</strong> These tools are for demonstration purposes only.
            </p>
            <p className="text-sm text-yellow-700">
              Generate mock data to populate your database with sample Epics, Features, Stories, Sprints, and Requests.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Create Demo Data</p>
                <p className="text-sm text-gray-600">
                  Creates minimal sample data for Demo Mode (2 projects, 2 epics, 2 features, 2 stories, 3 tasks, 1 sprint, 1 request, 1 meeting)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: ~15 records - Perfect for testing Demo Mode
                </p>
              </div>
              <button
                onClick={handleCreateDemoData}
                disabled={isCreatingDemo}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaDatabase />
                {isCreatingDemo ? 'Creating...' : 'Create Demo'}
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">Generate Mock Data</p>
                <p className="text-sm text-gray-600">
                  Creates 200 Epics, 400 Features, 800 Stories, 50 Sprints, 300 Requests, and 200 Change Requests
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: 1,950+ records - Takes several minutes
                </p>
              </div>
              <button
                onClick={handleGenerateMockData}
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaDatabase />
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
