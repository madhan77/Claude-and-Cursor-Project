import { useState, useMemo } from 'react';
import { useFeatures } from '../contexts/FeatureContext';
import { useEpics } from '../contexts/EpicContext';
import { useStories } from '../contexts/StoryContext';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import FeatureModal from '../components/FeatureModal';

export default function Features() {
  const { features, deleteFeature, loading } = useFeatures();
  const { epics } = useEpics();
  const { stories } = useStories();
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [expandedFeatures, setExpandedFeatures] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEpic, setFilterEpic] = useState('all');

  const filteredFeatures = useMemo(() => {
    let filtered = features;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === filterStatus);
    }

    if (filterEpic !== 'all') {
      filtered = filtered.filter(f => f.epicId === filterEpic);
    }

    return filtered;
  }, [features, filterStatus, filterEpic]);

  const getEpicName = (epicId) => {
    const epic = epics.find(e => e.id === epicId);
    return epic ? epic.name : 'No Epic';
  };

  const getStoryCount = (featureId) => {
    return stories.filter(s => s.featureId === featureId).length;
  };

  const getFeatureStories = (featureId) => {
    return stories.filter(s => s.featureId === featureId);
  };

  const toggleExpand = (featureId) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  };

  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setShowModal(true);
  };

  const handleDelete = async (featureId) => {
    if (window.confirm('Are you sure you want to delete this feature? This will not delete associated stories.')) {
      await deleteFeature(featureId);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFeature(null);
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
        <div className="text-gray-500">Loading features...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Features</h1>
          <p className="text-gray-600">Manage features and link them to epics</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> New Feature
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({features.length})
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

        {epics.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Epic:
            </label>
            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Epics</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>{epic.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Features List */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No features found</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Feature
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeatures.map((feature) => {
            const storyCount = getStoryCount(feature.id);
            const featureStories = getFeatureStories(feature.id);
            const isExpanded = expandedFeatures.has(feature.id);

            return (
              <div key={feature.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {storyCount > 0 && (
                        <button
                          onClick={() => toggleExpand(feature.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {feature.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                            {feature.status.replace('-', ' ')}
                          </span>
                          {feature.epicId && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {getEpicName(feature.epicId)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {storyCount} {storyCount !== 1 ? 'stories' : 'story'}
                          </span>
                        </div>
                        {feature.description && (
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(feature)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stories under this Feature */}
                {isExpanded && featureStories.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">User Stories:</h4>
                    <div className="space-y-2">
                      {featureStories.map((story) => (
                        <div
                          key={story.id}
                          className="bg-white p-3 rounded border border-gray-200 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{story.title}</div>
                              {story.description && (
                                <div className="text-gray-600 text-xs mt-1">{story.description}</div>
                              )}
                              {story.storyPoints && (
                                <div className="text-gray-500 text-xs mt-1">
                                  Story Points: {story.storyPoints}
                                </div>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(story.status)}`}>
                              {story.status.replace('-', ' ')}
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
        <FeatureModal
          feature={editingFeature}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
