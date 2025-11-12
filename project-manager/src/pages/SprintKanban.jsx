import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useSprints } from '../contexts/SprintContext';
import { useStories } from '../contexts/StoryContext';
import { FaChevronDown, FaGripVertical, FaUser, FaClock } from 'react-icons/fa';

const STATUS_COLUMNS = [
  { id: 'planning', label: 'Planning', color: 'bg-gray-100' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'testing', label: 'Testing', color: 'bg-yellow-100' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100' },
  { id: 'on-hold', label: 'On Hold', color: 'bg-red-100' }
];

export default function SprintKanban() {
  const { sprints } = useSprints();
  const { stories, updateStory } = useStories();
  const [selectedSprint, setSelectedSprint] = useState('');
  const [draggedStory, setDraggedStory] = useState(null);

  const activeSprint = useMemo(() => {
    if (!selectedSprint) return null;
    return sprints.find(s => s.id === selectedSprint);
  }, [sprints, selectedSprint]);

  const sprintStories = useMemo(() => {
    if (!activeSprint) return [];
    return stories.filter(s => (activeSprint.stories || []).includes(s.id));
  }, [activeSprint, stories]);

  const storiesByStatus = useMemo(() => {
    const grouped = {};
    STATUS_COLUMNS.forEach(col => {
      grouped[col.id] = sprintStories.filter(s => s.status === col.id);
    });
    return grouped;
  }, [sprintStories]);

  const handleDragStart = (e, story) => {
    setDraggedStory(story);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedStory(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();

    if (draggedStory && draggedStory.status !== newStatus) {
      try {
        await updateStory(draggedStory.id, { status: newStatus });
      } catch (error) {
        console.error('Error updating story status:', error);
      }
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

  const StoryCard = ({ story }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, story)}
      onDragEnd={handleDragEnd}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-start gap-2 mb-2">
        <FaGripVertical className="text-gray-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
            {story.title}
          </h4>
          {story.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {story.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {story.storyPoints && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">
                {story.storyPoints} pts
              </span>
            )}
            {story.priority && (
              <span className={`font-semibold ${getPriorityColor(story.priority)}`}>
                {story.priority.toUpperCase()}
              </span>
            )}
            {story.assignedTo && (
              <span className="flex items-center gap-1 text-gray-600">
                <FaUser size={10} />
                {story.assignedTo.split('@')[0]}
              </span>
            )}
            {story.targetDate && (
              <span className="flex items-center gap-1 text-gray-600">
                <FaClock size={10} />
                {story.targetDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sprint Kanban Board</h1>
          <p className="text-gray-600">Drag and drop stories to update their status</p>
        </div>

        {/* Sprint Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Sprint
          </label>
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a sprint...</option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.startDate} to {sprint.endDate})
              </option>
            ))}
          </select>
        </div>

        {!selectedSprint ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800">Please select a sprint to view the Kanban board</p>
          </div>
        ) : sprintStories.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800">No stories in this sprint yet. Add stories from the Sprint Board.</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {STATUS_COLUMNS.map(column => (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className={`${column.color} rounded-t-lg px-4 py-3 border-b-4 border-gray-300`}>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {column.label}
                    <span className="ml-2 text-xs font-normal">
                      ({storiesByStatus[column.id]?.length || 0})
                    </span>
                  </h3>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className="flex-1 bg-gray-50 p-3 rounded-b-lg min-h-[500px] space-y-3 border border-t-0 border-gray-200"
                >
                  {storiesByStatus[column.id]?.map(story => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                  {storiesByStatus[column.id]?.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                      Drop stories here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
