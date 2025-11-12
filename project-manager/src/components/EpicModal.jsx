import { useState, useEffect } from 'react';
import { useEpics } from '../contexts/EpicContext';
import FileAttachment from './FileAttachment';
import { FaTimes } from 'react-icons/fa';

export default function EpicModal({ epic, onClose }) {
  const { createEpic, updateEpic } = useEpics();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    businessValue: '',
    targetDate: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (epic) {
      setFormData({
        name: epic.name || '',
        description: epic.description || '',
        status: epic.status || 'planning',
        businessValue: epic.businessValue || '',
        targetDate: epic.targetDate || '',
        attachments: epic.attachments || []
      });
    }
  }, [epic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (epic) {
        await updateEpic(epic.id, formData);
      } else {
        await createEpic(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving epic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {epic ? 'Edit Epic' : 'Create New Epic'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Epic Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter epic name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the epic's goals and scope"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Value
              </label>
              <textarea
                name="businessValue"
                value={formData.businessValue}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What business value does this epic provide?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Completion Date
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Attachments */}
            <div>
              <FileAttachment
                attachments={formData.attachments}
                onAttachmentsChange={(attachments) => setFormData(prev => ({ ...prev, attachments }))}
                entityType="epics"
                entityId={epic?.id || 'temp-' + Date.now()}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (epic ? 'Update Epic' : 'Create Epic')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
