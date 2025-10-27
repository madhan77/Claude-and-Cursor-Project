import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdAccountBalance, MdLogout, MdArrowBack, MdAdd, MdTrendingUp, MdFlag } from 'react-icons/md';
import { mockGoals } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Goals = () => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'at_risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on_track':
        return 'On Track';
      case 'needs_attention':
        return 'Needs Attention';
      case 'at_risk':
        return 'At Risk';
      default:
        return 'Unknown';
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
                <MdFlag className="text-primary-600 text-3xl" />
                <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
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
        {/* Add Goal Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => toast.info('Goal creation coming soon!')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <MdAdd size={20} />
            Create New Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {mockGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{goal.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(goal.status)}`}>
                  {getStatusText(goal.status)}
                </span>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">{goal.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Current Amount</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Target Amount</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>

                {/* Remaining and Deadline */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">Remaining</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(goal.targetAmount - goal.currentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Target Date</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(goal.targetDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-lg font-medium opacity-90 mb-4">Goals Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-75 mb-1">Total Goals</p>
              <p className="text-3xl font-bold">{mockGoals.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Total Target</p>
              <p className="text-3xl font-bold">
                {formatCurrency(mockGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Total Saved</p>
              <p className="text-3xl font-bold">
                {formatCurrency(mockGoals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
