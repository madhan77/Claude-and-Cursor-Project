import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdHistory,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdSecurity,
} from 'react-icons/md';
import { mockAuditLogs } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const AuditLog = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'success', 'failed'

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <MdError className="text-red-600" size={20} />;
      default:
        return <MdInfo className="text-blue-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = filter === 'all'
    ? mockAuditLogs
    : mockAuditLogs.filter((log) => log.status === filter);

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
                <MdSecurity className="text-primary-600 text-3xl" />
                <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
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
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <MdSecurity className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">Security & Activity Tracking</p>
              <p className="text-sm text-blue-800">
                This audit log tracks all important actions in your account for security and compliance purposes.
                All timestamps are in your local timezone.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Activities ({mockAuditLogs.length})
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === 'success' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Successful ({mockAuditLogs.filter((l) => l.status === 'success').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === 'failed' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Failed ({mockAuditLogs.filter((l) => l.status === 'failed').length})
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MdHistory className="mx-auto text-gray-400 mb-4" size={64} />
                      <p className="text-gray-600">No audit logs found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{log.action}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-lg font-medium opacity-90 mb-4">Activity Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm opacity-75 mb-1">Total Actions</p>
              <p className="text-3xl font-bold">{mockAuditLogs.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Successful</p>
              <p className="text-3xl font-bold text-green-400">
                {mockAuditLogs.filter((l) => l.status === 'success').length}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-400">
                {mockAuditLogs.filter((l) => l.status === 'failed').length}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Success Rate</p>
              <p className="text-3xl font-bold">
                {Math.round((mockAuditLogs.filter((l) => l.status === 'success').length / mockAuditLogs.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
