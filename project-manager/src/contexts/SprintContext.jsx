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
import { addDays } from 'date-fns';

const SprintContext = createContext({});

export const useSprints = () => useContext(SprintContext);

export function SprintProvider({ children }) {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isDemoMode } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setSprints([]);
      setLoading(false);
      return;
    }

    // For demo mode, fetch without orderBy to avoid index requirement
    const q = isDemoMode
      ? collection(db, 'sprints')
      : query(collection(db, 'sprints'), orderBy('startDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let sprintsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter and sort client-side for demo mode
      if (isDemoMode) {
        sprintsData = sprintsData
          .filter(s => s.createdBy === 'demo-user-id')
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      }

      setSprints(sprintsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching sprints:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, isDemoMode]);

  async function createSprint(sprintData) {
    try {
      // Default to 2 week sprint
      const startDate = sprintData.startDate || new Date().toISOString().split('T')[0];
      const endDate = sprintData.endDate || addDays(new Date(startDate), 14).toISOString().split('T')[0];

      const newSprint = {
        ...sprintData,
        startDate,
        endDate,
        stories: sprintData.stories || [],
        features: sprintData.features || [],
        epics: sprintData.epics || [],
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'sprints'), newSprint);
      toast.success('Sprint created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast.error('Failed to create sprint');
      throw error;
    }
  }

  async function updateSprint(sprintId, updates) {
    try {
      const sprintRef = doc(db, 'sprints', sprintId);
      await updateDoc(sprintRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Sprint updated successfully!');
    } catch (error) {
      console.error('Error updating sprint:', error);
      toast.error('Failed to update sprint');
      throw error;
    }
  }

  async function deleteSprint(sprintId) {
    try {
      await deleteDoc(doc(db, 'sprints', sprintId));
      toast.success('Sprint deleted successfully!');
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast.error('Failed to delete sprint');
      throw error;
    }
  }

  async function addItemToSprint(sprintId, itemType, itemId) {
    try {
      const sprint = sprints.find(s => s.id === sprintId);
      const items = sprint[itemType] || [];

      if (!items.includes(itemId)) {
        await updateSprint(sprintId, {
          [itemType]: [...items, itemId]
        });
      }
    } catch (error) {
      console.error('Error adding item to sprint:', error);
      toast.error('Failed to add item to sprint');
      throw error;
    }
  }

  async function removeItemFromSprint(sprintId, itemType, itemId) {
    try {
      const sprint = sprints.find(s => s.id === sprintId);
      const items = sprint[itemType] || [];

      await updateSprint(sprintId, {
        [itemType]: items.filter(id => id !== itemId)
      });
    } catch (error) {
      console.error('Error removing item from sprint:', error);
      toast.error('Failed to remove item from sprint');
      throw error;
    }
  }

  const value = {
    sprints,
    loading,
    createSprint,
    updateSprint,
    deleteSprint,
    addItemToSprint,
    removeItemFromSprint
  };

  return (
    <SprintContext.Provider value={value}>
      {children}
    </SprintContext.Provider>
  );
}
