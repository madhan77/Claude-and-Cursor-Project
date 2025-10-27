import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdAccountBalance, MdLogout, MdArrowBack, MdAdd, MdCheckCircle, MdHourglassEmpty, MdFiberManualRecord } from 'react-icons/md';
import { mockServiceRequests } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const ServiceRequests = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'in_progress', 'completed'

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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle className="text-green-600" size={20} />;
      case 'in_progress':
        return <MdHourglassEmpty className="text-blue-600" size={20} />;
      case 'open':
        return <MdFiberManualRecord className="text-yellow-600" size={20} />;
      default:
        return <MdFiberManualRecord className="text-gray-600" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRequests = filter === 'all'
    ? mockServiceRequests
    : mockServiceRequests.filter((req) => req.status === filter);

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
                <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
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
        {/* Actions and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({mockServiceRequests.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'open' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Open ({mockServiceRequests.filter((r) => r.status === 'open').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'in_progress' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              In Progress ({mockServiceRequests.filter((r) => r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'completed' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed ({mockServiceRequests.filter((r) => r.status === 'completed').length})
            </button>
          </div>

          <button
            onClick={() => toast.info('Request creation form coming soon!')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <MdAdd size={20} />
            New Request
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-600">No service requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => toast.info('Request details coming soon!')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(request.status)}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{request.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Created Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(request.createdDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900">{formatDate(request.updatedDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Assigned To</p>
                    <p className="font-semibold text-gray-900">{request.assignedTo}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
