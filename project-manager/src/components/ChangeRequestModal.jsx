import { useState, useEffect } from 'react';
import { useRequests } from '../contexts/RequestContext';
import FileAttachment from './FileAttachment';
import { FaTimes } from 'react-icons/fa';

export default function ChangeRequestModal({ changeRequest, onClose }) {
  const { createChangeRequest, updateChangeRequest } = useRequests();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new',
    priority: 'medium',
    requestedBy: '',
    implementationDate: '',
    impactAnalysis: '',
    rollbackPlan: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (changeRequest) {
      setFormData({
        title: changeRequest.title || '',
        description: changeRequest.description || '',
        status: changeRequest.status || 'new',
        priority: changeRequest.priority || 'medium',
        requestedBy: changeRequest.requestedBy || '',
        implementationDate: changeRequest.implementationDate || '',
        impactAnalysis: changeRequest.impactAnalysis || '',
        rollbackPlan: changeRequest.rollbackPlan || '',
        attachments: changeRequest.attachments || []
      });
    }
  }, [changeRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (changeRequest) {
        await updateChangeRequest(changeRequest.id, formData);
      } else {
        await createChangeRequest(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving change request:', error);
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
            {changeRequest ? 'Edit Change Request' : 'Create New Change Request'}
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
                Change Request Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter change request title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the changes to be made"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <option value="new">New</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested By
              </label>
              <input
                type="text"
                name="requestedBy"
                value={formData.requestedBy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name or email of requester"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Date
              </label>
              <input
                type="date"
                name="implementationDate"
                value={formData.implementationDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact Analysis
              </label>
              <textarea
                name="impactAnalysis"
                value={formData.impactAnalysis}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What systems/features will be affected?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rollback Plan
              </label>
              <textarea
                name="rollbackPlan"
                value={formData.rollbackPlan}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How to revert if something goes wrong?"
              />
            </div>

            {/* File Attachments */}
            <div>
              <FileAttachment
                attachments={formData.attachments}
                onAttachmentsChange={(attachments) => setFormData(prev => ({ ...prev, attachments }))}
                entityType="changeRequests"
                entityId={changeRequest?.id || 'temp-' + Date.now()}
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
              {loading ? 'Saving...' : (changeRequest ? 'Update Change Request' : 'Create Change Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
