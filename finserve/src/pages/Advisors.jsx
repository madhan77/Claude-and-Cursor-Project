import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdVideoCall,
  MdMessage,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md';
import { mockAdvisors, mockMessages } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Advisors = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [activeTab, setActiveTab] = useState('advisors'); // 'advisors' or 'messages'

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleScheduleCall = (advisor) => {
    toast.success(`Call scheduled with ${advisor.name}`);
  };

  const handleSendMessage = (advisor) => {
    toast.info(`Opening message thread with ${advisor.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
                <MdArrowBack size={24} />
              </button>
              <div className="flex items-center gap-3">
                <MdMessage className="text-primary-600 text-3xl" />
                <h1 className="text-2xl font-bold text-gray-900">Advisors</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{currentUser?.displayName}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('advisors')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advisors'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Advisors
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'messages'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
              {mockMessages.filter((m) => m.unread).length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {mockMessages.filter((m) => m.unread).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Advisors Tab */}
        {activeTab === 'advisors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAdvisors.map((advisor) => (
              <div key={advisor.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={advisor.avatar}
                    alt={advisor.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{advisor.name}</h3>
                    <p className="text-sm text-gray-600">{advisor.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {advisor.availability === 'Available' ? (
                        <MdCheckCircle className="text-green-500" size={16} />
                      ) : (
                        <MdCancel className="text-red-500" size={16} />
                      )}
                      <span className={`text-xs ${advisor.availability === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
                        {advisor.availability}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">Specialty:</span>
                    <span>{advisor.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">Experience:</span>
                    <span>{advisor.yearsOfExperience} years</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MdEmail size={16} />
                    <span>{advisor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MdPhone size={16} />
                    <span>{advisor.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleScheduleCall(advisor)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    <MdVideoCall size={18} />
                    Schedule
                  </button>
                  <button
                    onClick={() => handleSendMessage(advisor)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    <MdMessage size={18} />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {mockMessages.length === 0 ? (
              <div className="p-12 text-center">
                <MdMessage className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-600">No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition ${
                      message.unread ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toast.info('Message thread coming soon!')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {message.advisorName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{message.advisorName}</h3>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(message.timestamp)}</p>
                        {message.unread && (
                          <span className="inline-block mt-1 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-15">{message.lastMessage}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Advisors;
