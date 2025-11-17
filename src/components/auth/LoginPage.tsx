import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Building2, User as UserIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'b2b' | 'b2c'>('b2c');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const role: UserRole = loginType === 'b2b' ? 'b2b_admin' : 'b2c_user';
      await login(email, password, role);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Unified Platform
          </h1>
          <p className="text-gray-300">Enterprise & Consumer Solutions</p>
        </div>

        {/* Login Type Toggle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-6 flex gap-2">
          <button
            onClick={() => setLoginType('b2c')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              loginType === 'b2c'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <UserIcon size={20} />
            <span className="font-medium">Personal</span>
          </button>
          <button
            onClick={() => setLoginType('b2b')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              loginType === 'b2b'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Building2 size={20} />
            <span className="font-medium">Business</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            {loginType === 'b2b' ? 'Enterprise Login' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={loginType === 'b2b' ? 'you@company.com' : 'you@example.com'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            {loginType === 'b2c' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                loginType === 'b2b'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } text-white shadow-lg hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {loginType === 'b2b' && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-medium transition-all">
                Sign in with SSO
              </button>
            </div>
          )}

          {loginType === 'b2c' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all">
                  <span className="text-2xl">G</span>
                </button>
                <button className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all">
                  <span className="text-2xl">f</span>
                </button>
                <button className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all">
                  <span className="text-2xl"></span>
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </a>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-lg p-4 text-sm text-gray-300">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p>Email: any@email.com</p>
          <p>Password: any password</p>
        </div>
      </div>
    </div>
  );
};
