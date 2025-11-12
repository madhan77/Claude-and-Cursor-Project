import { useState } from 'react';
import { useSprints } from '../contexts/SprintContext';
import { useStories } from '../contexts/StoryContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useEpics } from '../contexts/EpicContext';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaListUl } from 'react-icons/fa';
import { format, differenceInDays, parseISO } from 'date-fns';
import SprintModal from '../components/SprintModal';

export default function Sprints() {
  const { sprints, deleteSprint, loading } = useSprints();
  const { stories } = useStories();
  const { features } = useFeatures();
  const { epics } = useEpics();
  const [showModal, setShowModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const getSprintStats = (sprint) => {
    const sprintStories = stories.filter(s => (sprint.stories || []).includes(s.id));
    const sprintFeatures = features.filter(f => (sprint.features || []).includes(f.id));
    const sprintEpics = epics.filter(e => (sprint.epics || []).includes(e.id));

    const completedStories = sprintStories.filter(s => s.status === 'completed').length;
    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedPoints = sprintStories
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    return {
      totalStories: sprintStories.length,
      completedStories,
      totalFeatures: sprintFeatures.length,
      totalEpics: sprintEpics.length,
      totalPoints,
      completedPoints
    };
  };

  const getSprintStatus = (sprint) => {
    const today = new Date();
    const startDate = parseISO(sprint.startDate);
    const endDate = parseISO(sprint.endDate);

    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'completed';
    return 'active';
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = parseISO(endDate);
    return differenceInDays(end, today);
  };

  const handleEdit = (sprint) => {
    setEditingSprint(sprint);
    setShowModal(true);
  };

  const handleDelete = async (sprintId) => {
    if (window.confirm('Are you sure you want to delete this sprint? Items will not be deleted, only unassigned from this sprint.')) {
      await deleteSprint(sprintId);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSprint(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading sprints...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sprints</h1>
          <p className="text-gray-600">Manage your 2-week sprint cycles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> New Sprint
        </button>
      </div>

      {/* Sprints List */}
      {sprints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No sprints found</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Sprint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprints.map((sprint) => {
            const stats = getSprintStats(sprint);
            const status = getSprintStatus(sprint);
            const daysRemaining = getDaysRemaining(sprint.endDate);

            return (
              <div key={sprint.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {sprint.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(sprint)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(sprint.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {sprint.goal && (
                  <p className="text-gray-600 text-sm mb-4">{sprint.goal}</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>
                      {format(parseISO(sprint.startDate), 'MMM dd')} - {format(parseISO(sprint.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {status === 'active' && (
                    <div className="text-sm">
                      <span className={`font-medium ${daysRemaining < 3 ? 'text-red-600' : 'text-gray-700'}`}>
                        {daysRemaining} days remaining
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Stories:</span>
                    <span className="font-medium text-gray-800">
                      {stats.completedStories} / {stats.totalStories}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Story Points:</span>
                    <span className="font-medium text-gray-800">
                      {stats.completedPoints} / {stats.totalPoints}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Features:</span>
                    <span className="font-medium text-gray-800">{stats.totalFeatures}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Epics:</span>
                    <span className="font-medium text-gray-800">{stats.totalEpics}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                {stats.totalStories > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((stats.completedStories / stats.totalStories) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.completedStories / stats.totalStories) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <SprintModal
          sprint={editingSprint}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
