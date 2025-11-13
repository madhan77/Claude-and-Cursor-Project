import { useState, useEffect } from 'react';
import { useMeetings } from '../contexts/MeetingContext';
import { useProjects } from '../contexts/ProjectContext';
import { useSprints } from '../contexts/SprintContext';
import { FaTimes, FaCalendar, FaClock, FaUsers, FaLink } from 'react-icons/fa';

const MEETING_TYPES = [
  'Sprint Planning',
  'Daily Standup',
  'Sprint Review',
  'Sprint Retrospective',
  'Backlog Refinement',
  'General Discussion',
  'Other'
];

export default function MeetingModal({ meeting, onClose }) {
  const { addMeeting, updateMeeting } = useMeetings();
  const { projects } = useProjects();
  const { sprints } = useSprints();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Sprint Planning',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60, // in minutes
    projectId: '',
    sprintId: '',
    attendees: [],
    organizer: '',
    location: 'Virtual'
  });

  const [attendeeInput, setAttendeeInput] = useState('');

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        type: meeting.type || 'Sprint Planning',
        description: meeting.description || '',
        scheduledDate: meeting.scheduledDate || '',
        scheduledTime: meeting.scheduledTime || '',
        duration: meeting.duration || 60,
        projectId: meeting.projectId || '',
        sprintId: meeting.sprintId || '',
        attendees: meeting.attendees || [],
        organizer: meeting.organizer || '',
        location: meeting.location || 'Virtual'
      });
    }
  }, [meeting]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.scheduledDate || !formData.scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (meeting) {
        await updateMeeting(meeting.id, formData);
      } else {
        await addMeeting(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees.includes(attendeeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()]
      }));
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (attendee) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAttendee();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            {meeting ? 'Edit Meeting' : 'Create Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sprint Planning - Sprint 5"
              required
            />
          </div>

          {/* Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MEETING_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="15"
                step="15"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendar /> Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaClock /> Time *
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Project and Sprint Linking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaLink /> Linked Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaLink /> Linked Sprint
              </label>
              <select
                value={formData.sprintId}
                onChange={(e) => setFormData(prev => ({ ...prev, sprintId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.startDate} to {sprint.endDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizer (Scrum Master/Product Owner)
            </label>
            <input
              type="text"
              value={formData.organizer}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., john.doe@company.com"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaUsers /> Attendees
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email and press Enter"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.attendees.map((attendee, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {attendee}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(attendee)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Virtual, Office, etc."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Agenda
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting agenda and objectives..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              {meeting ? 'Update Meeting' : 'Create Meeting'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
