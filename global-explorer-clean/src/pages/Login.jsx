import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import {
  MdEmail,
  MdLock,
  MdPerson,
  MdTravelExplore,
  MdPublic,
} from 'react-icons/md';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back to Global Explorer!');
      } else {
        await signup(email, password, displayName);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error(isLogin ? 'Failed to login' : 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('Starting Google login...');
      await loginWithGoogle();
      console.log('Google login successful');
      toast.success('Welcome to Global Explorer!');
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized. Please contact support.');
      } else {
        toast.error(`Failed to login with Google: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <MdTravelExplore className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Global Explorer</h1>
          <p className="text-gray-600">Discover Your Next Adventure</p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isLogin ? 'Sign In to Your Account' : 'Create Your Account'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLogin ? 'Continue your travel journey' : 'Start exploring the world'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your password"
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Explore. Dream. Discover.
        </p>
      </div>
    </div>
  );
};

export default Login;
