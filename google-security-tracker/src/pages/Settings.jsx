import React, { useState } from 'react';
import { FiSettings, FiShield, FiBell, FiDatabase, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Settings = () => {
  const [autoScan, setAutoScan] = useState(
    localStorage.getItem('autoScan') === 'true'
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem('notifications') !== 'false'
  );
  const [scanFrequency, setScanFrequency] = useState(
    localStorage.getItem('scanFrequency') || 'daily'
  );

  const handleAutoScanChange = (value) => {
    setAutoScan(value);
    localStorage.setItem('autoScan', value.toString());
    toast.success(`Auto-scan ${value ? 'enabled' : 'disabled'}`);
  };

  const handleNotificationsChange = (value) => {
    setNotifications(value);
    localStorage.setItem('notifications', value.toString());
    toast.success(`Notifications ${value ? 'enabled' : 'disabled'}`);
  };

  const handleScanFrequencyChange = (value) => {
    setScanFrequency(value);
    localStorage.setItem('scanFrequency', value);
    toast.success(`Scan frequency updated to ${value}`);
  };

  const clearCache = () => {
    if (window.confirm('Clear all cached analysis results?')) {
      localStorage.removeItem('lastAnalysisResults');
      toast.success('Cache cleared successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
          <FiSettings />
          <span>Settings</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Configure your security tracker preferences
        </p>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <FiShield className="text-2xl text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-800">Automatic Security Scans</h3>
              <p className="text-sm text-gray-600">
                Automatically run security scans on schedule
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => handleAutoScanChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-800">Scan Frequency</h3>
              <p className="text-sm text-gray-600">
                How often to run automatic scans
              </p>
            </div>
            <select
              value={scanFrequency}
              onChange={(e) => handleScanFrequencyChange(e.target.value)}
              className="input-field w-40"
              disabled={!autoScan}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <FiBell className="text-2xl text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-800">Enable Notifications</h3>
              <p className="text-sm text-gray-600">
                Receive alerts about security issues
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => handleNotificationsChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <FiDatabase className="text-2xl text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-800">Clear Cache</h3>
              <p className="text-sm text-gray-600">
                Remove all cached analysis results
              </p>
            </div>
            <button onClick={clearCache} className="btn-danger">
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-center space-x-3 mb-4">
          <FiInfo className="text-2xl text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">About</h2>
        </div>
        <div className="space-y-2 text-gray-700">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Purpose:</strong> Comprehensive Google Apps Security Tracker</p>
          <p className="text-sm text-gray-600 mt-4">
            This tool analyzes your Google account for security vulnerabilities and provides
            automated remediation options. Your data is processed locally and never stored
            on external servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
