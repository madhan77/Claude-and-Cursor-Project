import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdInfo,
  MdEmojiEvents,
  MdAttachMoney,
  MdDescription,
  MdMessage,
  MdError,
} from 'react-icons/md';
import { mockNotifications } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'success', 'warning', 'info'

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getNotificationIcon = (icon, type) => {
    const iconMap = {
      trophy: <MdEmojiEvents size={24} />,
      alert: <MdWarning size={24} />,
      message: <MdMessage size={24} />,
      money: <MdAttachMoney size={24} />,
      document: <MdDescription size={24} />,
    };

    const iconComponent = iconMap[icon] || <MdInfo size={24} />;

    let colorClass = 'text-blue-600';
    if (type === 'success') colorClass = 'text-green-600';
    if (type === 'warning') colorClass = 'text-yellow-600';
    if (type === 'error') colorClass = 'text-red-600';

    return <div className={colorClass}>{iconComponent}</div>;
  };

  const getNotificationBgColor = (type, read) => {
    if (read) return 'bg-white';

    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  const handleMarkAsRead = (notificationId) => {
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    toast.success('All notifications marked as read');
  };

  const filteredNotifications = mockNotifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

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
                <MdNotifications className="text-primary-600 text-3xl" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({mockNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'success' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'warning' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'info' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Info
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <MdNotifications className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationBgColor(notification.type, notification.read)} rounded-xl shadow-md p-5 hover:shadow-lg transition cursor-pointer`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.icon, notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
