import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdSend,
  MdAttachFile,
  MdMoreVert,
  MdFiberManualRecord,
  MdSearch,
  MdChat,
} from 'react-icons/md';
import { mockChatConversations } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Chat = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(mockChatConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState(mockChatConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage = {
      id: `m${Date.now()}`,
      sender: 'user',
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: true,
    };

    // Update the selected conversation with the new message
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: messageInput,
      lastMessageTime: new Date().toISOString(),
    };

    setSelectedConversation(updatedConversation);

    // Update conversations list
    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversation.id ? updatedConversation : conv
    );
    setConversations(updatedConversations);

    setMessageInput('');

    // Simulate advisor typing and response after 2 seconds
    setTimeout(() => {
      const advisorReply = {
        id: `m${Date.now()}`,
        sender: 'advisor',
        content: 'Thank you for your message. I\'ll review this and get back to you shortly.',
        timestamp: new Date().toISOString(),
        read: false,
      };

      const updatedConvWithReply = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, advisorReply],
        lastMessage: advisorReply.content,
        lastMessageTime: advisorReply.timestamp,
        unreadCount: updatedConversation.unreadCount + 1,
      };

      setSelectedConversation(updatedConvWithReply);

      const finalConversations = conversations.map((conv) =>
        conv.id === selectedConversation.id ? updatedConvWithReply : conv
      );
      setConversations(finalConversations);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.advisorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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
                <MdChat className="text-primary-600 text-3xl" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  {totalUnreadCount > 0 && (
                    <p className="text-sm text-gray-600">{totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}</p>
                  )}
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '75vh' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                      selectedConversation.id === conversation.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={conversation.advisorAvatar}
                          alt={conversation.advisorName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conversation.advisorName}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{conversation.advisorTitle}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700 truncate">{conversation.lastMessage}</p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.advisorAvatar}
                      alt={selectedConversation.advisorName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedConversation.status)}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.advisorName}</h3>
                    <p className="text-xs text-gray-600">{selectedConversation.advisorTitle}</p>
                  </div>
                </div>
                <button className="text-gray-600 hover:text-gray-900">
                  <MdMoreVert size={24} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 shadow-sm rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info('File attachment coming soon!')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    <MdAttachFile size={24} />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdSend size={24} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
