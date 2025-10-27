import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdAccountBalance, MdLogout, MdArrowBack, MdTrendingUp } from 'react-icons/md';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  mockPortfolio,
  mockPerformanceData,
  mockAssetAllocation,
  calculatePortfolioValue,
  calculateTotalGains,
} from '../data/mockData';
import { formatCurrency, formatPercent, getChangeColor } from '../utils/formatters';
import { toast } from 'react-toastify';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Portfolio = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const totalValue = calculatePortfolioValue();
  const totalGains = calculateTotalGains();
  const gainsPercent = (totalGains / (totalValue - totalGains)) * 100;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
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
                <MdAccountBalance className="text-primary-600 text-3xl" />
                <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
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
        {/* Portfolio Value Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-lg font-medium opacity-90 mb-2">Total Portfolio Value</h2>
          <p className="text-5xl font-bold mb-2">{formatCurrency(totalValue)}</p>
          <div className="flex items-center gap-2">
            <MdTrendingUp size={20} />
            <span className="text-xl font-semibold">{formatCurrency(totalGains)}</span>
            <span className="text-sm opacity-90">({formatPercent(gainsPercent)})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Performance (Last 7 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} name="Portfolio Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Allocation */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAssetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockAssetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockPortfolio.map((holding) => (
                  <tr key={holding.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{holding.symbol}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{holding.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{holding.shares}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(holding.avgCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(holding.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-semibold ${getChangeColor(holding.gain)}`}>
                        {formatCurrency(holding.gain)}
                      </div>
                      <div className={`text-xs ${getChangeColor(holding.gain)}`}>
                        {formatPercent(holding.gainPercent)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
