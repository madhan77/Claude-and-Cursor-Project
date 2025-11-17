import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiShield, FiMail, FiVideo, FiHardDrive, FiCalendar, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const { currentUser, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <FiShield className="text-5xl text-primary-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Google Security Tracker</h1>
              <p className="text-gray-600">Comprehensive protection for your Google apps</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">What we monitor:</h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <FiMail className="text-2xl text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Gmail Security</h3>
                  <p className="text-sm text-gray-600">
                    Detect phishing emails, suspicious forwarding rules, and unauthorized filters
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <FiHardDrive className="text-2xl text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Drive Security</h3>
                  <p className="text-sm text-gray-600">
                    Find publicly shared files and overly permissive sharing settings
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <FiVideo className="text-2xl text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">YouTube Privacy</h3>
                  <p className="text-sm text-gray-600">
                    Identify potentially private videos that are publicly accessible
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <FiCalendar className="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Calendar Privacy</h3>
                  <p className="text-sm text-gray-600">
                    Check for publicly shared calendars and excessive sharing permissions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <FiLock className="text-2xl text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Automated Fixes</h3>
                  <p className="text-sm text-gray-600">
                    One-click remediation for detected security issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <FiShield className="text-6xl text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome</h2>
            <p className="text-gray-600">
              Sign in with your Google account to start monitoring your security
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 hover:border-primary-500 hover:shadow-lg text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="text-2xl" />
              <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Required Permissions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• View and manage your Gmail messages</li>
                <li>• View your YouTube channel and videos</li>
                <li>• View your Google Drive files</li>
                <li>• View your Google Calendar</li>
                <li>• Basic profile information</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Privacy Guarantee</h4>
              <p className="text-sm text-green-700">
                Your data is analyzed locally and never stored on our servers. We only access your Google data to perform security analysis.
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            By signing in, you agree to allow this app to analyze your Google account for security issues.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
