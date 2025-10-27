import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdSearch,
  MdFilterList,
  MdDownload,
  MdPerson,
  MdEmail,
  MdPhone,
  MdVerified,
} from 'react-icons/md';
import { mockAccounts, mockAccountTransactions } from '../data/mockData';
import { formatCurrency, formatDate, getChangeColor } from '../utils/formatters';
import { toast } from 'react-toastify';

const AccountDetails = () => {
  const { accountId } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const account = mockAccounts.find((acc) => acc.id === accountId);
  const accountTransactions = mockAccountTransactions[accountId] || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, credit, debit
  const [dateRange, setDateRange] = useState('all'); // all, 7days, 30days, 90days

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Get unique categories from transactions
  const categories = ['all', ...new Set(accountTransactions.map((t) => t.category))];

  // Filter transactions
  const filteredTransactions = accountTransactions.filter((transaction) => {
    // Search filter
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;

    // Type filter
    const matchesType = filterType === 'all' || transaction.type === filterType;

    // Date range filter
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    let matchesDate = true;

    if (dateRange === '7days') {
      const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
      matchesDate = transactionDate >= sevenDaysAgo;
    } else if (dateRange === '30days') {
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      matchesDate = transactionDate >= thirtyDaysAgo;
    } else if (dateRange === '90days') {
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));
      matchesDate = transactionDate >= ninetyDaysAgo;
    }

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  const handleExport = () => {
    toast.info('Exporting transactions to CSV...');
    // In a real app, this would generate and download a CSV file
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{account.type}</h1>
                  <p className="text-sm text-gray-600">{account.accountNumber}</p>
                </div>
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
        {/* Account Summary Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-75 mb-1">Current Balance</p>
              <p className="text-4xl font-bold">{formatCurrency(account.balance)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Account Type</p>
              <p className="text-2xl font-semibold">{account.type}</p>
              <p className="text-sm opacity-75">{account.bankName}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Interest Rate</p>
              <p className="text-2xl font-semibold">{account.interestRate}% APY</p>
              <p className="text-sm opacity-75">Status: {account.status}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Account Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Account Number</p>
                  <p className="font-semibold text-gray-900">{account.fullAccountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="font-semibold text-green-600">{account.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Opening Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(account.openDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Currency</p>
                  <p className="font-semibold text-gray-900">{account.currency}</p>
                </div>
              </div>

              {/* Account Features */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Account Features</p>
                <div className="flex flex-wrap gap-2">
                  {account.accountFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Relationships & Roles */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Relationships</h3>
              <div className="space-y-4">
                {account.relationships.map((relationship, index) => (
                  <div key={index} className="border-l-4 border-primary-600 pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{relationship.name}</p>
                        <p className="text-sm text-gray-600">{relationship.role}</p>
                      </div>
                      {relationship.relationshipType === 'Owner' && (
                        <MdVerified className="text-green-500" size={20} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MdEmail size={16} />
                        <span>{relationship.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MdPhone size={16} />
                        <span>{relationship.phone}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Type:</span> {relationship.relationshipType}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Ownership:</span> {relationship.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <MdDownload size={20} />
                Export
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mt-4">
              Showing {filteredTransactions.length} of {accountTransactions.length} transactions
            </p>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-600">
                      No transactions found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-gray-500">{transaction.status}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {transaction.reference}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${getChangeColor(transaction.amount)}`}>
                        {transaction.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(transaction.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
