import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import {
  MdEmail,
  MdLock,
  MdAccountBalance,
  MdFingerprint,
  MdMic,
  MdMicOff,
  MdHelpOutline
} from 'react-icons/md';
import BiometricHelpModal from '../components/BiometricHelpModal';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  isBiometricRegistered,
  registerBiometric,
  getBiometricType,
} from '../utils/biometricAuth';
import {
  isVoiceRecognitionAvailable,
  startVoiceInput,
  stopVoiceInput,
  parseLoginCommand,
  speakText,
} from '../utils/voiceRecognition';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if biometric authentication is available
    setBiometricAvailable(isBiometricAvailable());

    // Check if voice recognition is available
    setVoiceAvailable(isVoiceRecognitionAvailable());

    return () => {
      // Cleanup voice recognition on unmount
      if (voiceRecognition) {
        stopVoiceInput(voiceRecognition);
      }
    };
  }, []);

  useEffect(() => {
    // Check if user has registered biometric for this email
    if (email && biometricAvailable) {
      setBiometricRegistered(isBiometricRegistered(email));
    }
  }, [email, biometricAvailable]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to FinServe!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to FinServe!');
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
      toast.error('Please enter your email first');
      speakText('Please enter your email address');
      return;
    }

    if (!biometricRegistered) {
      // Register biometric for first-time use
      try {
        setLoading(true);
        speakText('Please use your biometric sensor to register');
        await registerBiometric(email);
        toast.success(`${getBiometricType()} registered successfully!`);
        speakText('Biometric registered successfully');
        setBiometricRegistered(true);
      } catch (error) {
        console.error('Biometric registration error:', error);
        toast.error('Failed to register biometric authentication');
        speakText('Biometric registration failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Authenticate with biometric
    setLoading(true);
    try {
      speakText('Please authenticate with your biometric sensor');
      const authenticated = await authenticateWithBiometric(email);

      if (authenticated) {
        // Use stored credentials or Firebase demo account
        await login(email, 'biometric-login');
        toast.success('Welcome to FinServe!');
        speakText('Login successful. Welcome to FinServe');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      toast.error('Biometric authentication failed');
      speakText('Authentication failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      // Stop listening
      if (voiceRecognition) {
        stopVoiceInput(voiceRecognition);
      }
      setIsListening(false);
      setVoiceRecognition(null);
      toast.info('Voice input stopped');
    } else {
      // Start listening
      speakText('Listening for voice commands');
      toast.info('Voice input started. Say "email" or "password" followed by your credentials');

      const recognition = startVoiceInput(
        (transcript, confidence) => {
          console.log('Voice input:', transcript, 'Confidence:', confidence);

          const command = parseLoginCommand(transcript);

          switch (command.type) {
            case 'email':
              setEmail(command.value);
              toast.success(`Email set to: ${command.value}`);
              speakText(`Email set to ${command.value}`);
              break;

            case 'password':
              setPassword(command.value);
              toast.success('Password entered');
              speakText('Password entered');
              break;

            case 'submit':
              speakText('Attempting to log in');
              handleSubmit(new Event('submit'));
              break;

            case 'biometric':
              handleBiometricLogin();
              break;

            default:
              toast.info(`Heard: "${transcript}"`);
              speakText(`I heard ${transcript}. Please say email, password, or login`);
          }

          setIsListening(false);
          setVoiceRecognition(null);
        },
        (error) => {
          console.error('Voice recognition error:', error);
          toast.error('Voice recognition failed');
          setIsListening(false);
          setVoiceRecognition(null);
        }
      );

      setVoiceRecognition(recognition);
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <MdAccountBalance className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FinServe</h1>
          <p className="text-gray-600">Wealth Management & Financial Services</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign In to Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Biometric and Voice Authentication */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Biometric Authentication Button */}
            {biometricAvailable && (
              <button
                onClick={handleBiometricLogin}
                disabled={loading || !email}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition duration-200 ${
                  biometricRegistered
                    ? 'bg-green-50 border-2 border-green-500 text-green-700 hover:bg-green-100'
                    : 'bg-purple-50 border-2 border-purple-500 text-purple-700 hover:bg-purple-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={`${getBiometricType()} ${biometricRegistered ? '(Registered)' : '(Setup)'}`}
              >
                <MdFingerprint className="text-2xl" />
                <span className="text-sm">
                  {biometricRegistered ? getBiometricType() : 'Setup ' + getBiometricType()}
                </span>
              </button>
            )}

            {/* Voice Authentication Button */}
            {voiceAvailable && (
              <button
                onClick={handleVoiceToggle}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition duration-200 ${
                  isListening
                    ? 'bg-red-50 border-2 border-red-500 text-red-700 hover:bg-red-100 animate-pulse'
                    : 'bg-blue-50 border-2 border-blue-500 text-blue-700 hover:bg-blue-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Voice Commands"
              >
                {isListening ? <MdMicOff className="text-2xl" /> : <MdMic className="text-2xl" />}
                <span className="text-sm">{isListening ? 'Stop Voice' : 'Voice Login'}</span>
              </button>
            )}
          </div>

          {/* Help Link for Biometric Setup */}
          {biometricAvailable && (
            <button
              onClick={() => setShowHelpModal(true)}
              className="mt-2 w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition"
            >
              <MdHelpOutline size={18} />
              How to setup {getBiometricType()}?
            </button>
          )}

          {/* Voice Instructions */}
          {voiceAvailable && isListening && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">Voice Commands:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• "Email [your-email@example.com]"</li>
                <li>• "Password [your password]"</li>
                <li>• "Login" or "Sign in"</li>
                <li>• "Face ID" or "Biometric"</li>
              </ul>
            </div>
          )}

          {/* Biometric Info */}
          {biometricAvailable && email && !biometricRegistered && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                <strong>Note:</strong> Click "{getBiometricType()}" to register for quick login with your device's biometric sensor.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Secure. Trusted. Professional.
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
