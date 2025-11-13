import { useState } from 'react';
import { useStories } from '../contexts/StoryContext';
import { useFeatures } from '../contexts/FeatureContext';
import { useEpics } from '../contexts/EpicContext';
import { useTasks } from '../contexts/TaskContext';
import { FaTimes, FaCheck, FaEdit, FaTrash, FaRobot, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ActionItemsReview({ actionItems: initialItems, meeting, onClose, onSave }) {
  const { addStory } = useStories();
  const { addFeature } = useFeatures();
  const { addEpic } = useEpics();
  const { addTask } = useTasks();

  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedItems, setSelectedItems] = useState(
    initialItems.map(item => item.id)
  );

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    setItems(prev =>
      prev.map(item =>
        item.id === editingId ? { ...editForm } : item
      )
    );
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  const handleApproveAndCreate = async () => {
    const itemsToCreate = items.filter(item => selectedItems.includes(item.id));

    if (itemsToCreate.length === 0) {
      toast.warning('Please select at least one action item to create');
      return;
    }

    let createdCount = {
      epics: 0,
      features: 0,
      stories: 0,
      tasks: 0
    };

    try {
      for (const item of itemsToCreate) {
        const baseData = {
          title: item.title,
          description: item.description,
          priority: item.priority || 'medium',
          status: item.status || 'planning',
          assignedTo: item.assignee || '',
          projectId: meeting.projectId || '',
          sprintId: meeting.sprintId || '',
          createdFrom: 'meeting',
          meetingId: meeting.id,
          meetingTitle: meeting.title
        };

        switch (item.type) {
          case 'epic':
            await addEpic({
              ...baseData,
              targetDate: item.dueDate || '',
              features: []
            });
            createdCount.epics++;
            break;

          case 'feature':
            await addFeature({
              ...baseData,
              epicId: '',
              targetDate: item.dueDate || '',
              stories: []
            });
            createdCount.features++;
            break;

          case 'story':
            await addStory({
              ...baseData,
              featureId: '',
              storyPoints: 0,
              acceptanceCriteria: '',
              tasks: [],
              notes: []
            });
            createdCount.stories++;
            break;

          case 'task':
            await addTask({
              ...baseData,
              storyId: '',
              dueDate: item.dueDate || '',
              tags: ['meeting-action']
            });
            createdCount.tasks++;
            break;

          default:
            console.warn(`Unknown item type: ${item.type}`);
        }
      }

      // Show summary toast
      const summary = [];
      if (createdCount.epics > 0) summary.push(`${createdCount.epics} Epic(s)`);
      if (createdCount.features > 0) summary.push(`${createdCount.features} Feature(s)`);
      if (createdCount.stories > 0) summary.push(`${createdCount.stories} Story(ies)`);
      if (createdCount.tasks > 0) summary.push(`${createdCount.tasks} Task(s)`);

      toast.success(`Created: ${summary.join(', ')}`);

      // Save to meeting
      onSave(items);
    } catch (error) {
      console.error('Error creating action items:', error);
      toast.error('Failed to create some action items');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'epic': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'feature': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'story': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'task': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-800';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaRobot className="text-purple-600" />
              AI-Extracted Action Items
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review, edit, and approve action items to create in your backlog
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {items.length}
              </div>
              <div className="text-xs text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {items.filter(i => i.type === 'epic').length}
              </div>
              <div className="text-xs text-gray-600">Epics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {items.filter(i => i.type === 'feature').length}
              </div>
              <div className="text-xs text-gray-600">Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {items.filter(i => i.type === 'story').length}
              </div>
              <div className="text-xs text-gray-600">Stories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {items.filter(i => i.type === 'task').length}
              </div>
              <div className="text-xs text-gray-600">Tasks</div>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No action items found in the transcript.
            </div>
          ) : (
            items.map((item) => {
              const isEditing = editingId === item.id;
              const isSelected = selectedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Title"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows="2"
                        placeholder="Description"
                      />
                      <div className="grid grid-cols-4 gap-3">
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="epic">Epic</option>
                          <option value="feature">Feature</option>
                          <option value="story">Story</option>
                          <option value="task">Task</option>
                        </select>
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <input
                          type="text"
                          value={editForm.assignee || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, assignee: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Assignee email"
                        />
                        <input
                          type="date"
                          value={editForm.dueDate || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-sm flex-1">
                            {item.title}
                          </h3>
                          <div className="flex gap-2 ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                              {item.priority?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          {item.assignee && (
                            <span>👤 {item.assignee}</span>
                          )}
                          {item.dueDate && (
                            <span>📅 {item.dueDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <div className="text-sm text-gray-600">
            {selectedItems.length} of {items.length} items selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveAndCreate}
              disabled={selectedItems.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <FaCheck /> Approve & Create ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
