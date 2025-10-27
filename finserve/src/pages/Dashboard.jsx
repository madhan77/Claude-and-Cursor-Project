import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MdAccountBalance,
  MdTrendingUp,
  MdLogout,
  MdDashboard,
  MdShowChart,
  MdAccountBalanceWallet,
  MdFlag,
  MdMessage,
  MdSupportAgent,
  MdDescription,
  MdNotifications,
  MdAutoAwesome,
  MdSecurity,
  MdPhone,
  MdVerifiedUser,
} from 'react-icons/md';
import { mockAccounts, mockTransactions, calculateNetWorth } from '../data/mockData';
import { formatCurrency, formatDate, getChangeColor } from '../utils/formatters';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const netWorth = calculateNetWorth();

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
            <div className="flex items-center gap-3">
              <MdAccountBalance className="text-primary-600 text-3xl" />
              <h1 className="text-2xl font-bold text-gray-900">FinServe</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{currentUser?.displayName || currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Net Worth Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-lg font-medium opacity-90 mb-2">Total Net Worth</h2>
          <p className="text-5xl font-bold mb-4">{formatCurrency(netWorth)}</p>
          <p className="text-sm opacity-75">Updated today</p>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdDashboard className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Dashboard</p>
              <p className="text-sm text-gray-600">Overview</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/portfolio')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdShowChart className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Portfolio</p>
              <p className="text-sm text-gray-600">Investments</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/goals')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdFlag className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Goals</p>
              <p className="text-sm text-gray-600">Track Progress</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/advisors')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdMessage className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Advisors</p>
              <p className="text-sm text-gray-600">Get Advice</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/service-requests')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdSupportAgent className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Requests</p>
              <p className="text-sm text-gray-600">Service Tickets</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/documents')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdDescription className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Documents</p>
              <p className="text-sm text-gray-600">Files & Reports</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdNotifications className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Notifications</p>
              <p className="text-sm text-gray-600">Alerts & Updates</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/insights')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdAutoAwesome className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">AI Insights</p>
              <p className="text-sm text-gray-600">Smart Advice</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdMessage className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-600">Message Advisors</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/call-center')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdPhone className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Call Center</p>
              <p className="text-sm text-gray-600">Video & Audio Calls</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/identity-verification')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
          >
            <MdVerifiedUser className="text-primary-600 text-3xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">KYC Verification</p>
              <p className="text-sm text-gray-600">Identity Screening</p>
            </div>
          </button>
        </div>

        {/* Accounts Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => navigate(`/account/${account.id}`)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">{account.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{account.accountNumber}</p>
                  </div>
                  <MdAccountBalance className="text-primary-600 text-2xl" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(account.balance)}</p>
                <p className="text-sm text-gray-600">{account.bankName}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-600">{account.interestRate}% APY</p>
                  <span className="text-xs text-primary-600 font-medium">View Details →</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.account}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${getChangeColor(transaction.amount)}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
