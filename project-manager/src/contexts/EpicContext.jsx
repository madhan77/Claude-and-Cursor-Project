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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const EpicContext = createContext({});

export const useEpics = () => useContext(EpicContext);

export function EpicProvider({ children }) {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch epics in real-time
  useEffect(() => {
    if (!currentUser) {
      setEpics([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'epics'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const epicsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEpics(epicsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching epics:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Create a new epic
  async function createEpic(epicData) {
    try {
      const newEpic = {
        ...epicData,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'epics'), newEpic);
      toast.success('Epic created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating epic:', error);
      toast.error('Failed to create epic');
      throw error;
    }
  }

  // Update an epic
  async function updateEpic(epicId, updates) {
    try {
      const epicRef = doc(db, 'epics', epicId);
      await updateDoc(epicRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Epic updated successfully!');
    } catch (error) {
      console.error('Error updating epic:', error);
      toast.error('Failed to update epic');
      throw error;
    }
  }

  // Delete an epic
  async function deleteEpic(epicId) {
    try {
      await deleteDoc(doc(db, 'epics', epicId));
      toast.success('Epic deleted successfully!');
    } catch (error) {
      console.error('Error deleting epic:', error);
      toast.error('Failed to delete epic');
      throw error;
    }
  }

  const value = {
    epics,
    loading,
    createEpic,
    updateEpic,
    deleteEpic
  };

  return (
    <EpicContext.Provider value={value}>
      {children}
    </EpicContext.Provider>
  );
}
