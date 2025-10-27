import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdLightbulb,
  MdTrendingUp,
  MdWarning,
  MdCheckCircle,
  MdAutoAwesome,
} from 'react-icons/md';
import { mockInsights } from '../data/mockData';
import { toast } from 'react-toastify';

const Insights = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    const iconProps = { size: 24 };
    switch (category) {
      case 'Investment':
        return <MdTrendingUp {...iconProps} className="text-blue-600" />;
      case 'Spending':
        return <MdWarning {...iconProps} className="text-yellow-600" />;
      case 'Tax':
        return <MdAccountBalance {...iconProps} className="text-purple-600" />;
      case 'Goals':
        return <MdCheckCircle {...iconProps} className="text-green-600" />;
      default:
        return <MdLightbulb {...iconProps} className="text-gray-600" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Investment':
        return 'bg-blue-50 border-blue-200';
      case 'Spending':
        return 'bg-yellow-50 border-yellow-200';
      case 'Tax':
        return 'bg-purple-50 border-purple-200';
      case 'Goals':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
                <MdArrowBack size={24} />
              </button>
              <div className="flex items-center gap-3">
                <MdAutoAwesome className="text-primary-600 text-3xl" />
                <h1 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{currentUser?.displayName}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <MdAutoAwesome size={32} />
            <h2 className="text-2xl font-bold">Personalized Financial Insights</h2>
          </div>
          <p className="text-purple-100 mb-4">
            Our AI analyzes your financial data to provide actionable recommendations tailored to your goals.
          </p>
          <div className="flex gap-6">
            <div>
              <p className="text-sm opacity-75 mb-1">Active Insights</p>
              <p className="text-3xl font-bold">{mockInsights.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">High Priority</p>
              <p className="text-3xl font-bold">{mockInsights.filter((i) => i.priority === 'high').length}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Avg Confidence</p>
              <p className="text-3xl font-bold">
                {Math.round(mockInsights.reduce((sum, i) => sum + i.confidence, 0) / mockInsights.length)}%
              </p>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="space-y-6">
          {mockInsights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${getCategoryColor(insight.category)} hover:shadow-lg transition`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getCategoryIcon(insight.category)}</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{insight.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(insight.priority)}`}>
                          {insight.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{insight.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">AI Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Analysis:</p>
                    <p className="text-sm text-gray-900">{insight.description}</p>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-primary-900 mb-2">Recommendation:</p>
                    <p className="text-sm text-primary-800">{insight.recommendation}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Potential Impact</p>
                      <p className="text-sm font-semibold text-green-600">{insight.impact}</p>
                    </div>
                    <button
                      onClick={() => toast.info('Action tracking coming soon!')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <MdLightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">How AI Insights Work</p>
              <p className="text-sm text-blue-800">
                Our AI continuously analyzes your spending patterns, investment performance, tax situations, and goal progress
                to identify opportunities for improvement. Each insight includes a confidence score based on data quality and
                historical accuracy. Higher confidence scores indicate more reliable recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
