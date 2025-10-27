import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import {
  MdAdd,
  MdLogout,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdPending,
  MdWarning,
  MdToday,
} from 'react-icons/md';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import StatCard from '../components/StatCard';
import {
  filterTasksByStatus,
  sortTasks,
  searchTasks,
  getTaskStats,
} from '../utils/helpers';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const { tasks, loading } = useTask();
  const navigate = useNavigate();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Get filtered, searched, and sorted tasks
  const displayedTasks = useMemo(() => {
    let result = tasks;
    result = filterTasksByStatus(result, filterStatus);
    result = searchTasks(result, searchTerm);
    result = sortTasks(result, sortBy);
    return result;
  }, [tasks, filterStatus, searchTerm, sortBy]);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'today', label: 'Today' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">TaskFlow</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {currentUser?.displayName || currentUser?.email}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <MdLogout size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={MdFilterList}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={MdCheckCircle}
            color="green"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={MdPending}
            color="yellow"
          />
          <StatCard
            title="Due Today"
            value={stats.today}
            icon={MdToday}
            color="purple"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={MdWarning}
            color="red"
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="createdAt">Newest First</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>

            {/* Add Task Button */}
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
            >
              <MdAdd size={20} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {filterOptions.find((opt) => opt.value === filterStatus)?.label} ({displayedTasks.length})
          </h2>
          <TaskList
            tasks={displayedTasks}
            emptyMessage={
              searchTerm
                ? 'No tasks match your search'
                : filterStatus === 'all'
                ? 'No tasks yet. Create your first task!'
                : `No ${filterStatus} tasks`
            }
          />
        </div>
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
