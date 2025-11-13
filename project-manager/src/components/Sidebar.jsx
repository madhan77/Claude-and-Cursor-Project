import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaCalendar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBook,
  FaCube,
  FaFileAlt,
  FaSync,
  FaClipboardList,
  FaColumns,
  FaExclamationCircle,
  FaVideo
} from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'react-toastify';

// Agile PM System Navigation
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userProfile, isDemoMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/projects', icon: FaProjectDiagram, label: 'Projects' },
    { path: '/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/calendar', icon: FaCalendar, label: 'Calendar' },
    { path: '/epics', icon: FaBook, label: 'Epics' },
    { path: '/features', icon: FaCube, label: 'Features' },
    { path: '/stories', icon: FaFileAlt, label: 'Stories' },
    { path: '/sprints', icon: FaSync, label: 'Sprints' },
    { path: '/sprint-board', icon: FaClipboardList, label: 'Sprint Board' },
    { path: '/sprint-kanban', icon: FaColumns, label: 'Sprint Kanban' },
    { path: '/requests', icon: FaExclamationCircle, label: 'Requests' },
    { path: '/meetings', icon: FaVideo, label: 'Meetings' },
    { path: '/team', icon: FaUsers, label: 'Team' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Failed to logout');
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaProjectDiagram className="text-3xl text-blue-500" />
            <h1 className="text-2xl font-bold">ProjectHub</h1>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-medium">{userProfile?.displayName || 'User'}</p>
              <p className="text-xs text-gray-400">{userProfile?.email}</p>
              {isDemoMode && (
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-full font-medium">
                    Demo Mode
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg
                      transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full
              text-gray-300 hover:bg-red-600 hover:text-white
              transition-colors duration-200"
          >
            <FaSignOutAlt size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
}
