import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdPhone,
  MdVideocam,
  MdScreenShare,
  MdMic,
  MdMicOff,
  MdVideocamOff,
  MdCallEnd,
  MdSchedule,
  MdHistory,
  MdPerson,
  MdCheckCircle,
  MdAccessTime,
  MdCalendarToday,
  MdSupportAgent,
  MdHome,
  MdEmail,
  MdCreditCard,
  MdSwapHoriz,
  MdLock,
  MdReceipt,
  MdPending,
  MdCancel,
} from 'react-icons/md';

const CallCenter = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('call'); // call, schedule, history, requests
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null); // audio, video
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [callReason, setCallReason] = useState('');

  // Service Request States
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState({
    newAddress: { street: '', city: '', state: '', zipCode: '' },
    newPhone: '',
    newEmail: '',
    chequeQuantity: '25',
    transferAmount: '',
    transferTo: '',
    transferFrom: '',
    otherDetails: '',
  });

  const advisors = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Financial Advisor',
      specialty: 'Investment Planning',
      status: 'available',
      rating: 4.9,
      totalCalls: 245,
      avatar: 'SJ',
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Tax Specialist',
      specialty: 'Tax Planning & Strategy',
      status: 'available',
      rating: 4.8,
      totalCalls: 189,
      avatar: 'MC',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'Wealth Manager',
      specialty: 'Estate Planning',
      status: 'busy',
      rating: 5.0,
      totalCalls: 312,
      avatar: 'ER',
    },
    {
      id: '4',
      name: 'David Kim',
      title: 'Retirement Specialist',
      specialty: 'Retirement Planning',
      status: 'available',
      rating: 4.7,
      totalCalls: 178,
      avatar: 'DK',
    },
  ];

  const callHistory = [
    {
      id: '1',
      advisor: 'Sarah Johnson',
      type: 'video',
      date: '2025-10-24',
      time: '2:30 PM',
      duration: '45 mins',
      status: 'completed',
      topic: 'Investment Portfolio Review',
    },
    {
      id: '2',
      advisor: 'Michael Chen',
      type: 'audio',
      date: '2025-10-20',
      time: '10:00 AM',
      duration: '30 mins',
      status: 'completed',
      topic: 'Tax Strategy Discussion',
    },
    {
      id: '3',
      advisor: 'Emily Rodriguez',
      type: 'video',
      date: '2025-10-15',
      time: '3:15 PM',
      duration: '1 hr 15 mins',
      status: 'completed',
      topic: 'Estate Planning Consultation',
    },
    {
      id: '4',
      advisor: 'David Kim',
      type: 'audio',
      date: '2025-10-10',
      time: '11:30 AM',
      duration: '25 mins',
      status: 'completed',
      topic: 'Retirement Plan Review',
    },
  ];

  const scheduledCalls = [
    {
      id: '1',
      advisor: 'Sarah Johnson',
      type: 'video',
      date: '2025-10-26',
      time: '2:00 PM',
      topic: 'Quarterly Portfolio Review',
      status: 'upcoming',
    },
    {
      id: '2',
      advisor: 'Michael Chen',
      type: 'audio',
      date: '2025-10-28',
      time: '10:30 AM',
      topic: 'Year-End Tax Planning',
      status: 'upcoming',
    },
  ];

  const serviceRequestTypes = [
    {
      id: 'address_change',
      title: 'Address Change',
      icon: <MdHome className="text-3xl" />,
      description: 'Update your residential or mailing address',
    },
    {
      id: 'phone_update',
      title: 'Phone Number Update',
      icon: <MdPhone className="text-3xl" />,
      description: 'Change your registered phone number',
    },
    {
      id: 'email_update',
      title: 'Email Update',
      icon: <MdEmail className="text-3xl" />,
      description: 'Update your email address',
    },
    {
      id: 'cheque_book',
      title: 'Cheque Book Order',
      icon: <MdReceipt className="text-3xl" />,
      description: 'Request a new cheque book',
    },
    {
      id: 'fund_transfer',
      title: 'Fund Transfer Setup',
      icon: <MdSwapHoriz className="text-3xl" />,
      description: 'Set up recurring or one-time transfers',
    },
    {
      id: 'password_reset',
      title: 'Online Banking Password Reset',
      icon: <MdLock className="text-3xl" />,
      description: 'Reset your online banking password',
    },
    {
      id: 'credit_card',
      title: 'Credit/Debit Card Services',
      icon: <MdCreditCard className="text-3xl" />,
      description: 'Card activation, replacement, or blocking',
    },
  ];

  const serviceRequestsHistory = [
    {
      id: '1',
      type: 'Address Change',
      date: '2025-10-23',
      status: 'completed',
      details: 'Updated address to 456 Oak Street, NY',
    },
    {
      id: '2',
      type: 'Cheque Book Order',
      date: '2025-10-20',
      status: 'pending',
      details: '25 cheques ordered',
    },
    {
      id: '3',
      type: 'Email Update',
      date: '2025-10-15',
      status: 'completed',
      details: 'Email changed to newemail@example.com',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const startCall = (type, advisor) => {
    setCallType(type);
    setSelectedAdvisor(advisor);
    setIsInCall(true);
    toast.success(`Starting ${type} call with ${advisor.name}...`);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    toast.info('Call ended');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Microphone on' : 'Microphone muted');
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast.info(isVideoOff ? 'Camera on' : 'Camera off');
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.info(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started');
  };

  const scheduleCall = (e) => {
    e.preventDefault();
    if (!selectedAdvisor || !scheduledDate || !scheduledTime || !callReason) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success(`Call scheduled with ${selectedAdvisor.name} for ${scheduledDate} at ${scheduledTime}`);
    setScheduledDate('');
    setScheduledTime('');
    setCallReason('');
    setSelectedAdvisor(null);
  };

  const handleServiceRequest = (e) => {
    e.preventDefault();
    if (!requestType) {
      toast.error('Please select a service type');
      return;
    }
    const requestTypeName = serviceRequestTypes.find(t => t.id === requestType)?.title;
    toast.success(`${requestTypeName} request submitted successfully! We'll process it within 24-48 hours.`);
    setRequestType('');
    setRequestDetails({
      newAddress: { street: '', city: '', state: '', zipCode: '' },
      newPhone: '',
      newEmail: '',
      chequeQuantity: '25',
      transferAmount: '',
      transferTo: '',
      transferFrom: '',
      otherDetails: '',
    });
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
                <MdAccountBalance className="text-primary-600 text-3xl" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Call Center</h1>
                  <p className="text-sm text-gray-600">Connect with Financial Advisors</p>
                </div>
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
        {/* Active Call Screen */}
        {isInCall && selectedAdvisor && (
          <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
            <div className="w-full h-full relative">
              {/* Video Display */}
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                {callType === 'video' && !isVideoOff ? (
                  <div className="relative w-full h-full">
                    {/* Simulated Video Feed */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 mx-auto">
                          {selectedAdvisor.avatar}
                        </div>
                        <p className="text-white text-2xl font-semibold">{selectedAdvisor.name}</p>
                        <p className="text-gray-300 mt-2">{selectedAdvisor.title}</p>
                      </div>
                    </div>

                    {/* Your Video (Picture in Picture) */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {currentUser?.displayName?.charAt(0) || 'U'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-40 h-40 bg-primary-600 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-6 mx-auto">
                      {selectedAdvisor.avatar}
                    </div>
                    <p className="text-white text-3xl font-semibold">{selectedAdvisor.name}</p>
                    <p className="text-gray-300 text-lg mt-2">{selectedAdvisor.title}</p>
                    <p className="text-gray-400 mt-4">
                      {callType === 'audio' ? 'Audio Call in Progress' : 'Video Off'}
                    </p>
                  </div>
                )}
              </div>

              {/* Screen Sharing Indicator */}
              {isScreenSharing && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <MdScreenShare />
                  <span className="font-medium">Sharing Screen</span>
                </div>
              )}

              {/* Call Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-white rounded-2xl shadow-2xl px-8 py-4 flex items-center gap-4">
                  {/* Mute Button */}
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition ${
                      isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {isMuted ? (
                      <MdMicOff className="text-white text-2xl" />
                    ) : (
                      <MdMic className="text-gray-700 text-2xl" />
                    )}
                  </button>

                  {/* Video Toggle (only for video calls) */}
                  {callType === 'video' && (
                    <button
                      onClick={toggleVideo}
                      className={`p-4 rounded-full transition ${
                        isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {isVideoOff ? (
                        <MdVideocamOff className="text-white text-2xl" />
                      ) : (
                        <MdVideocam className="text-gray-700 text-2xl" />
                      )}
                    </button>
                  )}

                  {/* Screen Share */}
                  <button
                    onClick={toggleScreenShare}
                    className={`p-4 rounded-full transition ${
                      isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <MdScreenShare className={isScreenSharing ? 'text-white text-2xl' : 'text-gray-700 text-2xl'} />
                  </button>

                  {/* End Call Button */}
                  <button
                    onClick={endCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition ml-4"
                  >
                    <MdCallEnd className="text-white text-2xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('call')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === 'call'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MdPhone size={20} />
                Make a Call
              </div>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === 'schedule'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MdSchedule size={20} />
                Schedule Call
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === 'history'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MdHistory size={20} />
                Call History
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === 'requests'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MdSupportAgent size={20} />
                Service Requests
              </div>
            </button>
          </div>
        </div>

        {/* Make a Call Tab */}
        {activeTab === 'call' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Advisors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advisors.map((advisor) => (
                <div key={advisor.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {advisor.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{advisor.name}</h3>
                        <p className="text-sm text-gray-600">{advisor.title}</p>
                        <p className="text-xs text-primary-600 mt-1">{advisor.specialty}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        advisor.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {advisor.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MdCheckCircle className="text-green-600" />
                      {advisor.rating} rating
                    </div>
                    <div>{advisor.totalCalls} calls</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startCall('audio', advisor)}
                      disabled={advisor.status !== 'available'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdPhone size={20} />
                      Audio Call
                    </button>
                    <button
                      onClick={() => startCall('video', advisor)}
                      disabled={advisor.status !== 'available'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdVideocam size={20} />
                      Video Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Call Tab */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule a Call</h2>
              <form onSubmit={scheduleCall} className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Advisor</label>
                    <select
                      value={selectedAdvisor?.id || ''}
                      onChange={(e) => setSelectedAdvisor(advisors.find((a) => a.id === e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Choose an advisor...</option>
                      {advisors.map((advisor) => (
                        <option key={advisor.id} value={advisor.id}>
                          {advisor.name} - {advisor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Call</label>
                    <textarea
                      value={callReason}
                      onChange={(e) => setCallReason(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Please describe what you'd like to discuss..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Schedule Call
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Calls</h2>
              <div className="space-y-4">
                {scheduledCalls.map((call) => (
                  <div key={call.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{call.advisor}</h3>
                        <p className="text-sm text-gray-600 mt-1">{call.topic}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {call.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MdCalendarToday />
                        {call.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MdAccessTime />
                        {call.time}
                      </div>
                    </div>
                    <button className="mt-4 w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition">
                      Cancel Call
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Call History</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advisor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {callHistory.map((call) => (
                      <tr key={call.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <MdPerson className="text-gray-400 text-xl" />
                            <span className="font-medium text-gray-900">{call.advisor}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              call.type === 'video'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {call.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{call.date}</div>
                          <div className="text-gray-500">{call.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{call.duration}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{call.topic}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {call.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Service Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Service Request</h2>

            {!requestType ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {serviceRequestTypes.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setRequestType(service.id)}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-left group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-primary-600 group-hover:scale-110 transition">
                        {service.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {serviceRequestTypes.find(t => t.id === requestType)?.title}
                  </h3>
                  <button
                    onClick={() => setRequestType('')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <MdCancel size={24} />
                  </button>
                </div>

                <form onSubmit={handleServiceRequest} className="space-y-6">
                  {/* Address Change Form */}
                  {requestType === 'address_change' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={requestDetails.newAddress.street}
                          onChange={(e) => setRequestDetails({...requestDetails, newAddress: {...requestDetails.newAddress, street: e.target.value}})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            value={requestDetails.newAddress.city}
                            onChange={(e) => setRequestDetails({...requestDetails, newAddress: {...requestDetails.newAddress, city: e.target.value}})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <input
                            type="text"
                            value={requestDetails.newAddress.state}
                            onChange={(e) => setRequestDetails({...requestDetails, newAddress: {...requestDetails.newAddress, state: e.target.value}})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={requestDetails.newAddress.zipCode}
                          onChange={(e) => setRequestDetails({...requestDetails, newAddress: {...requestDetails.newAddress, zipCode: e.target.value}})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone Update Form */}
                  {requestType === 'phone_update' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
                      <input
                        type="tel"
                        value={requestDetails.newPhone}
                        onChange={(e) => setRequestDetails({...requestDetails, newPhone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  )}

                  {/* Email Update Form */}
                  {requestType === 'email_update' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                      <input
                        type="email"
                        value={requestDetails.newEmail}
                        onChange={(e) => setRequestDetails({...requestDetails, newEmail: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="newemail@example.com"
                        required
                      />
                    </div>
                  )}

                  {/* Cheque Book Order Form */}
                  {requestType === 'cheque_book' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Cheques</label>
                      <select
                        value={requestDetails.chequeQuantity}
                        onChange={(e) => setRequestDetails({...requestDetails, chequeQuantity: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="25">25 Cheques</option>
                        <option value="50">50 Cheques</option>
                        <option value="100">100 Cheques</option>
                      </select>
                    </div>
                  )}

                  {/* Fund Transfer Form */}
                  {requestType === 'fund_transfer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer From</label>
                        <input
                          type="text"
                          value={requestDetails.transferFrom}
                          onChange={(e) => setRequestDetails({...requestDetails, transferFrom: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="Account number or name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer To</label>
                        <input
                          type="text"
                          value={requestDetails.transferTo}
                          onChange={(e) => setRequestDetails({...requestDetails, transferTo: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="Account number or name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="number"
                          value={requestDetails.transferAmount}
                          onChange={(e) => setRequestDetails({...requestDetails, transferAmount: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Reset Form */}
                  {requestType === 'password_reset' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-900 mb-2">
                        <strong>Important:</strong> For security reasons, we'll send password reset instructions to your registered email and phone number.
                      </p>
                      <p className="text-sm text-yellow-800">
                        Please verify your identity by clicking the link in the email we send you.
                      </p>
                    </div>
                  )}

                  {/* Credit/Debit Card Form */}
                  {requestType === 'credit_card' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                      >
                        <option value="">Select service...</option>
                        <option value="activate">Activate New Card</option>
                        <option value="replace">Replace Lost/Stolen Card</option>
                        <option value="block">Block/Freeze Card</option>
                        <option value="unblock">Unblock Card</option>
                      </select>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
                    <textarea
                      value={requestDetails.otherDetails}
                      onChange={(e) => setRequestDetails({...requestDetails, otherDetails: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRequestType('')}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Request History */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request History</h2>
              <div className="space-y-4">
                {serviceRequestsHistory.map((request) => (
                  <div key={request.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{request.type}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.details}</p>
                        <p className="text-xs text-gray-500">Submitted on {request.date}</p>
                      </div>
                      {request.status === 'completed' ? (
                        <MdCheckCircle className="text-green-600 text-2xl" />
                      ) : (
                        <MdPending className="text-yellow-600 text-2xl" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallCenter;
