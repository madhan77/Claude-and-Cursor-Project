import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useSprints } from '../contexts/SprintContext';
import { useStories } from '../contexts/StoryContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useEpics } from '../contexts/EpicContext';
import { useRequests } from '../contexts/RequestContext';
import { useTasks } from '../contexts/TaskContext';
import { useProjects } from '../contexts/ProjectContext';
import { FaChevronDown, FaGripVertical, FaUser, FaClock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const STATUS_COLUMNS = [
  { id: 'planning', label: 'Planning', color: 'bg-gray-100' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'testing', label: 'Testing', color: 'bg-yellow-100' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100' },
  { id: 'on-hold', label: 'On Hold', color: 'bg-red-100' }
];

const TASK_STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100' }
];

export default function SprintKanban() {
  const { sprints } = useSprints();
  const { stories, updateStory } = useStories();
  const { features, updateFeature } = useFeatures();
  const { epics, updateEpic } = useEpics();
  const { requests, changeRequests, updateRequest, updateChangeRequest } = useRequests();
  const { tasks, updateTask } = useTasks();
  const { projects, updateProject } = useProjects();

  const [selectedSprint, setSelectedSprint] = useState('');
  const [viewMode, setViewMode] = useState('stories'); // stories, features, epics, requests, changeRequests, tasks, projects
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState('');

  const activeSprint = useMemo(() => {
    if (!selectedSprint) return null;
    return sprints.find(s => s.id === selectedSprint);
  }, [sprints, selectedSprint]);

  // Get items for current view mode
  const sprintItems = useMemo(() => {
    if (!activeSprint) return [];

    switch (viewMode) {
      case 'stories':
        return stories.filter(s => (activeSprint.stories || []).includes(s.id));
      case 'features':
        return features.filter(f => (activeSprint.features || []).includes(f.id));
      case 'epics':
        return epics.filter(e => (activeSprint.epics || []).includes(e.id));
      case 'requests':
        return requests;
      case 'changeRequests':
        return changeRequests;
      case 'tasks':
        return tasks;
      case 'projects':
        return projects;
      default:
        return [];
    }
  }, [activeSprint, viewMode, stories, features, epics, requests, changeRequests, tasks, projects]);

  // Group items by status
  const itemsByStatus = useMemo(() => {
    const columns = viewMode === 'tasks' ? TASK_STATUS_COLUMNS : STATUS_COLUMNS;
    const grouped = {};
    columns.forEach(col => {
      grouped[col.id] = sprintItems.filter(item => item.status === col.id);
    });
    return grouped;
  }, [sprintItems, viewMode]);

  const getUpdateFunction = () => {
    switch (viewMode) {
      case 'stories': return updateStory;
      case 'features': return updateFeature;
      case 'epics': return updateEpic;
      case 'requests': return updateRequest;
      case 'changeRequests': return updateChangeRequest;
      case 'tasks': return updateTask;
      case 'projects': return updateProject;
      default: return null;
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();

    if (draggedItem && draggedItem.status !== newStatus) {
      try {
        const updateFn = getUpdateFunction();
        if (updateFn) {
          await updateFn(draggedItem.id, { status: newStatus });
        }
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const startEditDescription = (item) => {
    setEditingId(item.id);
    setEditDescription(item.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  const saveDescription = async (item) => {
    try {
      const updateFn = getUpdateFunction();
      if (updateFn) {
        await updateFn(item.id, { description: editDescription });
      }
      setEditingId(null);
      setEditDescription('');
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      case 'critical': return 'text-red-800 font-bold';
      default: return 'text-gray-600';
    }
  };

  const getItemTitle = (item) => {
    return item.title || item.name || 'Untitled';
  };

  const ItemCard = ({ item }) => {
    const isEditing = editingId === item.id;

    return (
      <div
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-2 mb-2">
          {!isEditing && <FaGripVertical className="text-gray-400 mt-1 flex-shrink-0 cursor-move" />}
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
              {getItemTitle(item)}
            </h4>

            {/* Description with inline editing */}
            {isEditing ? (
              <div className="space-y-2 mb-2">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveDescription(item)}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FaSave size={10} /> Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 flex items-center gap-1"
                  >
                    <FaTimes size={10} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {item.description && (
                  <div className="relative group">
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <button
                      onClick={() => startEditDescription(item)}
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-opacity"
                      title="Edit description"
                    >
                      <FaEdit size={10} />
                    </button>
                  </div>
                )}
                {!item.description && (
                  <button
                    onClick={() => startEditDescription(item)}
                    className="text-xs text-blue-600 hover:text-blue-800 mb-2"
                  >
                    + Add description
                  </button>
                )}
              </>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {item.storyPoints && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">
                  {item.storyPoints} pts
                </span>
              )}
              {item.priority && (
                <span className={`font-semibold ${getPriorityColor(item.priority)}`}>
                  {item.priority.toUpperCase()}
                </span>
              )}
              {item.assignedTo && (
                <span className="flex items-center gap-1 text-gray-600">
                  <FaUser size={10} />
                  {item.assignedTo.split('@')[0]}
                </span>
              )}
              {(item.targetDate || item.dueDate) && (
                <span className="flex items-center gap-1 text-gray-600">
                  <FaClock size={10} />
                  {item.targetDate || item.dueDate}
                </span>
              )}
              {item.releaseVersion && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                  {item.releaseVersion}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const columns = viewMode === 'tasks' ? TASK_STATUS_COLUMNS : STATUS_COLUMNS;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sprint Kanban Board</h1>
          <p className="text-gray-600">Drag and drop items to update their status</p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Sprint Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sprint
              </label>
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a sprint...</option>
                {sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.startDate} to {sprint.endDate})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Type
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stories">Stories</option>
                <option value="features">Features</option>
                <option value="epics">Epics</option>
                <option value="tasks">Tasks</option>
                <option value="projects">Projects</option>
                <option value="requests">Requests</option>
                <option value="changeRequests">Change Requests</option>
              </select>
            </div>
          </div>

          {!selectedSprint && ['stories', 'features', 'epics'].includes(viewMode) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Please select a sprint to view {viewMode}
            </div>
          )}
        </div>

        {/* Kanban Board */}
        {(selectedSprint || !['stories', 'features', 'epics'].includes(viewMode)) ? (
          <div className={`grid gap-4 ${columns.length === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
            {columns.map(column => (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-t-lg px-4 py-3 border-b-4 border-gray-300`}>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {column.label}
                    <span className="ml-2 text-xs font-normal">
                      ({itemsByStatus[column.id]?.length || 0})
                    </span>
                  </h3>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className="flex-1 bg-gray-50 p-3 rounded-b-lg min-h-[600px] space-y-3 border border-t-0 border-gray-200"
                >
                  {itemsByStatus[column.id]?.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                  {itemsByStatus[column.id]?.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                      Drop {viewMode} here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800">Select a sprint to view the Kanban board</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
