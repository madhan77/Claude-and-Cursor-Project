import { useState, useMemo } from 'react';
import { useStories } from '../contexts/StoryContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useEpics } from '../contexts/EpicContext';
import { useTasks } from '../contexts/TaskContext';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaStickyNote, FaTasks } from 'react-icons/fa';
import StoryModal from '../components/StoryModal';
import { format } from 'date-fns';

export default function Stories() {
  const { stories, deleteStory, addNote, loading } = useStories();
  const { features } = useFeatures();
  const { epics } = useEpics();
  const { tasks } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [expandedStories, setExpandedStories] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFeature, setFilterFeature] = useState('all');
  const [noteText, setNoteText] = useState({});

  const filteredStories = useMemo(() => {
    let filtered = stories;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (filterFeature !== 'all') {
      filtered = filtered.filter(s => s.featureId === filterFeature);
    }

    return filtered;
  }, [stories, filterStatus, filterFeature]);

  const getFeatureName = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    return feature ? feature.name : 'No Feature';
  };

  const getEpicName = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    if (feature && feature.epicId) {
      const epic = epics.find(e => e.id === feature.epicId);
      return epic ? epic.name : '';
    }
    return '';
  };

  const getStoryTasks = (storyId) => {
    return tasks.filter(t => t.storyId === storyId);
  };

  const toggleExpand = (storyId) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedStories(newExpanded);
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setShowModal(true);
  };

  const handleDelete = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story? This will not delete associated tasks.')) {
      await deleteStory(storyId);
    }
  };

  const handleAddNote = async (storyId) => {
    const text = noteText[storyId]?.trim();
    if (text) {
      await addNote(storyId, text);
      setNoteText(prev => ({ ...prev, [storyId]: '' }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStory(null);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Stories</h1>
          <p className="text-gray-600">Manage user stories with tasks and notes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> New Story
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
            All ({stories.length})
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
        </div>

        {features.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Feature:
            </label>
            <select
              value={filterFeature}
              onChange={(e) => setFilterFeature(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Features</option>
              {features.map(feature => (
                <option key={feature.id} value={feature.id}>{feature.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stories List */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No stories found</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Story
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStories.map((story) => {
            const storyTasks = getStoryTasks(story.id);
            const isExpanded = expandedStories.has(story.id);
            const epicName = getEpicName(story.featureId);

            return (
              <div key={story.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleExpand(story.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {story.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                            {story.status.replace('-', ' ')}
                          </span>
                          {story.priority && (
                            <span className={`text-xs font-semibold ${getPriorityColor(story.priority)}`}>
                              {story.priority.toUpperCase()}
                            </span>
                          )}
                          {story.storyPoints && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                              {story.storyPoints} pts
                            </span>
                          )}
                          {story.featureId && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {getFeatureName(story.featureId)}
                            </span>
                          )}
                          {epicName && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {epicName}
                            </span>
                          )}
                        </div>
                        {story.description && (
                          <p className="text-gray-600 text-sm">{story.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaTasks /> {storyTasks.length} tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStickyNote /> {(story.notes || []).length} notes
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded view with Tasks and Notes */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Tasks Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FaTasks /> Tasks ({storyTasks.length})
                        </h4>
                        {storyTasks.length === 0 ? (
                          <p className="text-sm text-gray-500">No tasks yet</p>
                        ) : (
                          <div className="space-y-2">
                            {storyTasks.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white p-3 rounded border border-gray-200 text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">{task.title}</div>
                                    {task.description && (
                                      <div className="text-gray-600 text-xs mt-1">{task.description}</div>
                                    )}
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                    {task.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FaStickyNote /> Notes ({(story.notes || []).length})
                        </h4>
                        <div className="space-y-2 mb-3">
                          {(story.notes || []).map((note) => (
                            <div
                              key={note.id}
                              className="bg-white p-3 rounded border border-gray-200 text-sm"
                            >
                              <p className="text-gray-800">{note.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {note.createdAt && format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={noteText[story.id] || ''}
                            onChange={(e) => setNoteText(prev => ({ ...prev, [story.id]: e.target.value }))}
                            placeholder="Add a note..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddNote(story.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddNote(story.id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <StoryModal
          story={editingStory}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
