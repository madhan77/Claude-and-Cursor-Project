import { useState, useMemo } from 'react';
import { useSprints } from '../contexts/SprintContext';
import { useStories } from '../contexts/StoryContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useEpics } from '../contexts/EpicContext';
import { FaPlus, FaMinus, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function SprintBoard() {
  const { sprints, addItemToSprint, removeItemFromSprint } = useSprints();
  const { stories } = useStories();
  const { features } = useFeatures();
  const { epics } = useEpics();
  const [selectedSprint, setSelectedSprint] = useState('');
  const [showBacklog, setShowBacklog] = useState(true);
  const [viewMode, setViewMode] = useState('stories'); // stories, features, epics

  const activeSprint = useMemo(() => {
    if (!selectedSprint) return null;
    return sprints.find(s => s.id === selectedSprint);
  }, [sprints, selectedSprint]);

  const sprintItems = useMemo(() => {
    if (!activeSprint) return [];

    switch (viewMode) {
      case 'stories':
        return stories.filter(s => (activeSprint.stories || []).includes(s.id));
      case 'features':
        return features.filter(f => (activeSprint.features || []).includes(f.id));
      case 'epics':
        return epics.filter(e => (activeSprint.epics || []).includes(e.id));
      default:
        return [];
    }
  }, [activeSprint, viewMode, stories, features, epics]);

  const backlogItems = useMemo(() => {
    const allSprintItems = new Set();

    sprints.forEach(sprint => {
      const itemList = viewMode === 'stories' ? sprint.stories || [] :
                      viewMode === 'features' ? sprint.features || [] :
                      sprint.epics || [];
      itemList.forEach(id => allSprintItems.add(id));
    });

    switch (viewMode) {
      case 'stories':
        return stories.filter(s => !allSprintItems.has(s.id));
      case 'features':
        return features.filter(f => !allSprintItems.has(f.id));
      case 'epics':
        return epics.filter(e => !allSprintItems.has(e.id));
      default:
        return [];
    }
  }, [sprints, stories, features, epics, viewMode]);

  const handleAddToSprint = async (itemId) => {
    if (!selectedSprint) return;
    const itemType = viewMode === 'stories' ? 'stories' :
                     viewMode === 'features' ? 'features' : 'epics';
    await addItemToSprint(selectedSprint, itemType, itemId);
  };

  const handleRemoveFromSprint = async (itemId) => {
    if (!selectedSprint) return;
    const itemType = viewMode === 'stories' ? 'stories' :
                     viewMode === 'features' ? 'features' : 'epics';
    await removeItemFromSprint(selectedSprint, itemType, itemId);
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

  const renderItem = (item, inSprint = false) => {
    const title = viewMode === 'stories' ? item.title : item.name;
    const showPoints = viewMode === 'stories' && item.storyPoints;
    const showPriority = viewMode === 'stories' && item.priority;

    return (
      <div
        key={item.id}
        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
              {showPoints && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                  {item.storyPoints} pts
                </span>
              )}
              {showPriority && (
                <span className={`text-xs font-semibold ${
                  item.priority === 'high' ? 'text-red-600' :
                  item.priority === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {item.priority.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => inSprint ? handleRemoveFromSprint(item.id) : handleAddToSprint(item.id)}
            disabled={!selectedSprint && !inSprint}
            className={`p-2 rounded ${
              inSprint
                ? 'text-red-600 hover:bg-red-50'
                : selectedSprint
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={inSprint ? 'Remove from sprint' : 'Add to sprint'}
          >
            {inSprint ? <FaMinus /> : <FaPlus />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sprint Planning</h1>
        <p className="text-gray-600">Plan your sprints by adding stories, features, and epics</p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Sprint
            </label>
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a sprint to plan...</option>
              {sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.startDate} to {sprint.endDate})
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stories">Stories</option>
              <option value="features">Features</option>
              <option value="epics">Epics</option>
            </select>
          </div>
        </div>

        {!selectedSprint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Please select a sprint to start planning
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sprint Items */}
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-t-lg px-4 py-3">
            <h2 className="font-semibold text-blue-900">
              {selectedSprint ? activeSprint?.name || 'Sprint' : 'Sprint Items'}
              <span className="ml-2 text-sm font-normal">
                ({sprintItems.length} {viewMode})
              </span>
            </h2>
          </div>
          <div className="border border-t-0 border-gray-200 rounded-b-lg p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto">
            {!selectedSprint ? (
              <div className="text-center text-gray-500 py-12">
                Select a sprint to view its items
              </div>
            ) : sprintItems.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No {viewMode} in this sprint yet
                <br />
                <span className="text-sm">Add items from the backlog</span>
              </div>
            ) : (
              <div className="space-y-3">
                {sprintItems.map(item => renderItem(item, true))}
              </div>
            )}
          </div>
        </div>

        {/* Backlog */}
        <div>
          <div
            className="bg-gray-100 border border-gray-200 rounded-t-lg px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200"
            onClick={() => setShowBacklog(!showBacklog)}
          >
            <h2 className="font-semibold text-gray-900">
              Backlog
              <span className="ml-2 text-sm font-normal">
                ({backlogItems.length} {viewMode})
              </span>
            </h2>
            {showBacklog ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {showBacklog && (
            <div className="border border-t-0 border-gray-200 rounded-b-lg p-4 bg-white min-h-[400px] max-h-[600px] overflow-y-auto">
              {backlogItems.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  No {viewMode} in backlog
                  <br />
                  <span className="text-sm">All items are assigned to sprints</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {backlogItems.map(item => renderItem(item, false))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
