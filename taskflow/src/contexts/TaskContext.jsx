import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
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

  // Subscribe to tasks
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt on the client side
        tasksData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });

        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        toast.error('Failed to load tasks');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Add new task
  const addTask = async (taskData) => {
    if (!currentUser) {
      console.error('No current user');
      return;
    }

    try {
      console.log('Adding task with data:', taskData);
      console.log('Current user ID:', currentUser.uid);

      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: currentUser.uid,
        completed: false,
        createdAt: serverTimestamp(),
      });

      console.log('Task added successfully with ID:', docRef.id);
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error(`Failed to add task: ${error.message}`);
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
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
