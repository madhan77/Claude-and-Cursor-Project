import { format, isToday, isTomorrow, isPast, isFuture, isThisWeek, startOfDay } from 'date-fns';

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Priority colors
export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

// Category colors
export const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-cyan-100 text-cyan-800',
];

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = date.toDate ? date.toDate() : new Date(date);

  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  return format(dateObj, 'MMM dd, yyyy');
};

// Format time for display
export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return format(dateObj, 'h:mm a');
};

// Check if task is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const dateObj = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
  return isPast(dateObj) && !isToday(dateObj);
};

// Filter tasks by status
export const filterTasksByStatus = (tasks, filter) => {
  switch (filter) {
    case 'today':
      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const date = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        return isToday(date);
      });
    case 'upcoming':
      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const date = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        return isFuture(date) && !isToday(date);
      });
    case 'completed':
      return tasks.filter((task) => task.completed);
    case 'active':
      return tasks.filter((task) => !task.completed);
    default:
      return tasks;
  }
};

// Sort tasks
export const sortTasks = (tasks, sortBy) => {
  const tasksCopy = [...tasks];

  switch (sortBy) {
    case 'dueDate':
      return tasksCopy.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateA = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
        const dateB = b.dueDate.toDate ? b.dueDate.toDate() : new Date(b.dueDate);
        return dateA - dateB;
      });
    case 'priority':
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return tasksCopy.sort((a, b) => {
        return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
      });
    case 'createdAt':
    default:
      return tasksCopy.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
  }
};

// Search tasks
export const searchTasks = (tasks, searchTerm) => {
  if (!searchTerm.trim()) return tasks;

  const term = searchTerm.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.category?.toLowerCase().includes(term) ||
      task.tags?.some((tag) => tag.toLowerCase().includes(term))
  );
};

// Get task statistics
export const getTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const overdue = tasks.filter((t) => !t.completed && isOverdue(t.dueDate)).length;
  const today = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const date = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
    return isToday(date);
  }).length;

  return { total, completed, active, overdue, today };
};
