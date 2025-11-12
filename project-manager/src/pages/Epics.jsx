import { useState, useMemo } from 'react';
import { useEpics } from '../contexts/EpicContext';
import { useFeatures } from '../contexts/FeatureContext';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import EpicModal from '../components/EpicModal';

export default function Epics() {
  const { epics, deleteEpic, loading } = useEpics();
  const { features } = useFeatures();
  const [showModal, setShowModal] = useState(false);
  const [editingEpic, setEditingEpic] = useState(null);
  const [expandedEpics, setExpandedEpics] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEpics = useMemo(() => {
    if (filterStatus === 'all') return epics;
    return epics.filter(epic => epic.status === filterStatus);
  }, [epics, filterStatus]);

  const getFeatureCount = (epicId) => {
    return features.filter(f => f.epicId === epicId).length;
  };

  const getEpicFeatures = (epicId) => {
    return features.filter(f => f.epicId === epicId);
  };

  const toggleExpand = (epicId) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const handleEdit = (epic) => {
    setEditingEpic(epic);
    setShowModal(true);
  };

  const handleDelete = async (epicId) => {
    if (window.confirm('Are you sure you want to delete this epic? This will not delete associated features.')) {
      await deleteEpic(epicId);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEpic(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading epics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Epics</h1>
          <p className="text-gray-600">Manage your project epics and track their progress</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> New Epic
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({epics.length})
        </button>
        <button
          onClick={() => setFilterStatus('planning')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'planning'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Planning
        </button>
        <button
          onClick={() => setFilterStatus('in-progress')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'in-progress'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilterStatus('testing')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'testing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Testing
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilterStatus('on-hold')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'on-hold'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          On Hold
        </button>
      </div>

      {/* Epics List */}
      {filteredEpics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No epics found</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Epic
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEpics.map((epic) => {
            const featureCount = getFeatureCount(epic.id);
            const epicFeatures = getEpicFeatures(epic.id);
            const isExpanded = expandedEpics.has(epic.id);

            return (
              <div key={epic.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {featureCount > 0 && (
                        <button
                          onClick={() => toggleExpand(epic.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {epic.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(epic.status)}`}>
                            {epic.status.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {featureCount} feature{featureCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {epic.description && (
                          <p className="text-gray-600 text-sm">{epic.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(epic)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(epic.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features under this Epic */}
                {isExpanded && epicFeatures.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Features:</h4>
                    <div className="space-y-2">
                      {epicFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="bg-white p-3 rounded border border-gray-200 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{feature.name}</div>
                              {feature.description && (
                                <div className="text-gray-600 text-xs mt-1">{feature.description}</div>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(feature.status)}`}>
                              {feature.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <EpicModal
          epic={editingEpic}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
