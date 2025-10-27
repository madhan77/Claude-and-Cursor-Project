import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './DemoAuthContext';
import { toast } from 'react-toastify';

const TaskContext = createContext({});

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load tasks from localStorage
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const storageKey = `tasks_${currentUser.uid}`;
    const savedTasks = localStorage.getItem(storageKey);

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        const tasksWithDates = parsedTasks.map(task => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : null,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      }
    }
    setLoading(false);
  }, [currentUser]);

  // Save tasks to localStorage whenever they change
  const saveTasks = (updatedTasks) => {
    if (currentUser) {
      const storageKey = `tasks_${currentUser.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
    }
  };

  // Add new task
  const addTask = async (taskData) => {
    if (!currentUser) return;

    try {
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...taskData,
        userId: currentUser.uid,
        completed: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Toggle task completion
  const toggleTaskComplete = async (taskId, currentStatus) => {
    try {
      await updateTask(taskId, { completed: !currentStatus });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
