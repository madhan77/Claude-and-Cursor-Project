import { useState } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { FaPlus, FaEdit, FaTrash, FaExclamationCircle, FaExchangeAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import RequestModal from '../components/RequestModal';
import ChangeRequestModal from '../components/ChangeRequestModal';

export default function Requests() {
  const { requests, changeRequests, deleteRequest, deleteChangeRequest, loading } = useRequests();
  const [activeTab, setActiveTab] = useState('requests'); // requests, changeRequests
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterPriority !== 'all' && req.priority !== filterPriority) return false;
    return true;
  });

  const filteredChangeRequests = changeRequests.filter(cr => {
    if (filterStatus !== 'all' && cr.status !== filterStatus) return false;
    if (filterPriority !== 'all' && cr.priority !== filterPriority) return false;
    return true;
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (itemId, isChangeRequest = false) => {
    const message = isChangeRequest
      ? 'Are you sure you want to delete this change request?'
      : 'Are you sure you want to delete this request?';

    if (window.confirm(message)) {
      if (isChangeRequest) {
        await deleteChangeRequest(itemId);
      } else {
        await deleteRequest(itemId);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderRequest = (request) => {
    return (
      <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                {request.priority?.toUpperCase()}
              </span>
            </div>
            {request.description && (
              <p className="text-gray-600 text-sm mb-3">{request.description}</p>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              {request.requestedBy && (
                <span>Requested by: {request.requestedBy}</span>
              )}
              {request.createdAt && (
                <span>Created: {format(request.createdAt.toDate(), 'MMM dd, yyyy')}</span>
              )}
              {request.targetDate && (
                <span>Target: {request.targetDate}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(request)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(request.id, false)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {request.releaseVersion && (
          <div className="bg-gray-50 rounded p-2 text-sm">
            <span className="text-gray-600">Release Version: </span>
            <span className="font-medium text-gray-800">{request.releaseVersion}</span>
          </div>
        )}
      </div>
    );
  };

  const renderChangeRequest = (changeRequest) => {
    return (
      <div key={changeRequest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{changeRequest.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(changeRequest.status)}`}>
                {changeRequest.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`text-xs font-semibold ${getPriorityColor(changeRequest.priority)}`}>
                {changeRequest.priority?.toUpperCase()}
              </span>
            </div>
            {changeRequest.description && (
              <p className="text-gray-600 text-sm mb-3">{changeRequest.description}</p>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              {changeRequest.requestedBy && (
                <span>Requested by: {changeRequest.requestedBy}</span>
              )}
              {changeRequest.createdAt && (
                <span>Created: {format(changeRequest.createdAt.toDate(), 'MMM dd, yyyy')}</span>
              )}
              {changeRequest.implementationDate && (
                <span>Implementation: {changeRequest.implementationDate}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(changeRequest)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(changeRequest.id, true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {(changeRequest.impactAnalysis || changeRequest.rollbackPlan) && (
          <div className="space-y-2 mt-3">
            {changeRequest.impactAnalysis && (
              <div className="bg-yellow-50 rounded p-3 text-sm">
                <span className="font-medium text-yellow-900">Impact: </span>
                <span className="text-yellow-800">{changeRequest.impactAnalysis}</span>
              </div>
            )}
            {changeRequest.rollbackPlan && (
              <div className="bg-blue-50 rounded p-3 text-sm">
                <span className="font-medium text-blue-900">Rollback Plan: </span>
                <span className="text-blue-800">{changeRequest.rollbackPlan}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Production Requests</h1>
          <p className="text-gray-600">Track release requests and change requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> New {activeTab === 'requests' ? 'Request' : 'Change Request'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('requests');
            setEditingItem(null);
          }}
          className={`px-4 py-2 font-medium ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FaExclamationCircle className="inline mr-2" />
          Requests ({requests.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('changeRequests');
            setEditingItem(null);
          }}
          className={`px-4 py-2 font-medium ${
            activeTab === 'changeRequests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FaExchangeAlt className="inline mr-2" />
          Change Requests ({changeRequests.length})
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'requests' ? (
        filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No requests found</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(renderRequest)}
          </div>
        )
      ) : (
        filteredChangeRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No change requests found</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Change Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChangeRequests.map(renderChangeRequest)}
          </div>
        )
      )}

      {showModal && (
        activeTab === 'requests' ? (
          <RequestModal
            request={editingItem}
            onClose={handleCloseModal}
          />
        ) : (
          <ChangeRequestModal
            changeRequest={editingItem}
            onClose={handleCloseModal}
          />
        )
      )}
    </div>
  );
}
