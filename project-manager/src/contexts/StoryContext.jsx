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

const StoryContext = createContext({});

export const useStories = () => useContext(StoryContext);

export function StoryProvider({ children }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isDemoMode } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setStories([]);
      setLoading(false);
      return;
    }

    // Fetch all stories, filter client-side for demo mode (no index needed)
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter client-side for demo mode
      if (isDemoMode) {
        storiesData = storiesData.filter(s => s.createdBy === 'demo-user-id');
      }

      setStories(storiesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching stories:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, isDemoMode]);

  async function createStory(storyData) {
    try {
      const newStory = {
        ...storyData,
        notes: storyData.notes || [],
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'stories'), newStory);
      toast.success('Story created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to create story');
      throw error;
    }
  }

  async function updateStory(storyId, updates) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Story updated successfully!');
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update story');
      throw error;
    }
  }

  async function deleteStory(storyId) {
    try {
      await deleteDoc(doc(db, 'stories', storyId));
      toast.success('Story deleted successfully!');
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
      throw error;
    }
  }

  async function addNote(storyId, noteText) {
    try {
      const story = stories.find(s => s.id === storyId);
      const notes = story.notes || [];

      const newNote = {
        id: Date.now().toString(),
        text: noteText,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      await updateStory(storyId, {
        notes: [...notes, newNote]
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
      throw error;
    }
  }

  const value = {
    stories,
    loading,
    createStory,
    updateStory,
    deleteStory,
    addNote
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
}
