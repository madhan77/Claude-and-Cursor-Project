import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdLock, MdFingerprint, MdHelpOutline } from 'react-icons/md';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  isBiometricRegistered,
  registerBiometric,
  getBiometricType,
} from '../utils/biometricAuth';
import BiometricHelpModal from '../components/BiometricHelpModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometric = async () => {
      const available = isBiometricAvailable();
      setBiometricAvailable(available);

      if (available && email) {
        const registered = isBiometricRegistered(email);
        setBiometricRegistered(registered);
      }
    };

    checkBiometric();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password authentication is not enabled. Please check Firebase Console.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error(`Error: ${error.message || 'Failed to login'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      if (!biometricRegistered) {
        // Register biometric for the first time
        await registerBiometric(email);
        setBiometricRegistered(true);
        toast.success(`${getBiometricType()} registered successfully! You can now use it to login.`);
      } else {
        // Authenticate with biometric
        const authenticated = await authenticateWithBiometric(email);
        if (authenticated) {
          // Use a dummy password since Firebase requires it, but biometric is verified
          await login(email, 'biometric-login-verified');
          toast.success(`Login successful with ${getBiometricType()}!`);
          navigate('/dashboard');
        } else {
          toast.error('Biometric authentication failed');
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Biometric authentication was cancelled');
      } else if (error.message.includes('not supported')) {
        toast.error(error.message);
      } else {
        toast.error('Biometric authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TaskFlow</h1>
          <p className="text-gray-600">Sign in to manage your tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your email"
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
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
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

        {biometricAvailable && (
          <>
            <button
              onClick={handleBiometricLogin}
              disabled={loading || !email}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdFingerprint className="text-2xl" />
              {biometricRegistered ? `Login with ${getBiometricType()}` : `Setup ${getBiometricType()}`}
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="mt-2 w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition"
            >
              <MdHelpOutline size={18} />
              How to setup {getBiometricType()}?
            </button>
          </>
        )}

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      <BiometricHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        biometricType={getBiometricType()}
      />
    </div>
  );
};

export default Login;
