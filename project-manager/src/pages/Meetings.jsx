import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useMeetings } from '../contexts/MeetingContext';
import { useProjects } from '../contexts/ProjectContext';
import { useSprints } from '../contexts/SprintContext';
import MeetingModal from '../components/MeetingModal';
import { FaPlus, FaCalendar, FaUsers, FaPlay, FaCheck, FaTimes, FaEdit, FaTrash, FaLink } from 'react-icons/fa';
import { format } from 'date-fns';

export default function Meetings() {
  const navigate = useNavigate();
  const { meetings, deleteMeeting, startMeeting } = useMeetings();
  const { projects } = useProjects();
  const { sprints } = useSprints();
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [filter, setFilter] = useState('all'); // all, scheduled, in-progress, completed

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'N/A';
  };

  const getSprintName = (sprintId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint ? sprint.name : 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <FaCalendar />;
      case 'in-progress': return <FaPlay />;
      case 'completed': return <FaCheck />;
      case 'cancelled': return <FaTimes />;
      default: return <FaCalendar />;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (filter === 'all') return true;
    return meeting.status === filter;
  });

  const handleEdit = (meeting) => {
    setSelectedMeeting(meeting);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      await deleteMeeting(id);
    }
  };

  const handleStartMeeting = async (meeting) => {
    await startMeeting(meeting.id);
    navigate(`/meeting-room/${meeting.id}`);
  };

  const handleJoinMeeting = (meetingId) => {
    navigate(`/meeting-room/${meetingId}`);
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Meetings</h1>
            <p className="text-gray-600">Schedule and manage sprint meetings with voice transcription</p>
          </div>
          <button
            onClick={() => {
              setSelectedMeeting(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Create Meeting
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'scheduled', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(meeting => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Meeting Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex-1">
                  {meeting.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(meeting.status)}`}>
                  {getStatusIcon(meeting.status)}
                  {meeting.status}
                </span>
              </div>

              {/* Meeting Type */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {meeting.type || 'General'}
                </span>
              </div>

              {/* Meeting Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-gray-400" />
                  <span>{meeting.scheduledDate} at {meeting.scheduledTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-400" />
                  <span>{meeting.attendees?.length || 0} attendees</span>
                </div>
                {meeting.projectId && (
                  <div className="flex items-center gap-2">
                    <FaLink className="text-gray-400" />
                    <span className="text-xs">Project: {getProjectName(meeting.projectId)}</span>
                  </div>
                )}
                {meeting.sprintId && (
                  <div className="flex items-center gap-2">
                    <FaLink className="text-gray-400" />
                    <span className="text-xs">Sprint: {getSprintName(meeting.sprintId)}</span>
                  </div>
                )}
              </div>

              {meeting.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {meeting.description}
                </p>
              )}

              {/* Meeting Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                {meeting.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartMeeting(meeting)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <FaPlay size={12} /> Start
                  </button>
                )}
                {meeting.status === 'in-progress' && (
                  <button
                    onClick={() => handleJoinMeeting(meeting.id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <FaPlay size={12} /> Join
                  </button>
                )}
                {meeting.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/meeting-room/${meeting.id}`)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
                  >
                    View Notes
                  </button>
                )}
                {meeting.status !== 'in-progress' && (
                  <>
                    <button
                      onClick={() => handleEdit(meeting)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2 text-sm"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-2 text-sm"
                    >
                      <FaTrash size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMeetings.length === 0 && (
          <div className="text-center py-12">
            <FaCalendar className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No meetings found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first meeting to get started</p>
          </div>
        )}

        {/* Meeting Modal */}
        {showModal && (
          <MeetingModal
            meeting={selectedMeeting}
            onClose={() => {
              setShowModal(false);
              setSelectedMeeting(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
