import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const MeetingContext = createContext();

export function useMeetings() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingProvider');
  }
  return context;
}

export function MeetingProvider({ children }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isDemoMode } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    // For demo mode, filter by createdBy
    const q = isDemoMode
      ? query(
          collection(db, 'meetings'),
          where('createdBy', '==', 'demo-user-id'),
          orderBy('createdAt', 'desc')
        )
      : query(
          collection(db, 'meetings'),
          orderBy('createdAt', 'desc')
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching meetings:', error);
      // Don't show error toast on login page - will auto-load after authentication
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isDemoMode]);

  const addMeeting = async (meetingData) => {
    try {
      const docRef = await addDoc(collection(db, 'meetings'), {
        ...meetingData,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'scheduled', // scheduled, in-progress, completed, cancelled
        transcript: '',
        actionItems: [],
        attendees: meetingData.attendees || []
      });
      toast.success('Meeting created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast.error('Failed to create meeting');
      throw error;
    }
  };

  const updateMeeting = async (id, updates) => {
    try {
      const meetingRef = doc(db, 'meetings', id);
      await updateDoc(meetingRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      toast.success('Meeting updated successfully');
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error('Failed to update meeting');
      throw error;
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await deleteDoc(doc(db, 'meetings', id));
      toast.success('Meeting deleted successfully');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
      throw error;
    }
  };

  const startMeeting = async (id) => {
    try {
      await updateMeeting(id, {
        status: 'in-progress',
        startedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error starting meeting:', error);
      throw error;
    }
  };

  const completeMeeting = async (id, transcript, actionItems) => {
    try {
      await updateMeeting(id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        transcript,
        actionItems
      });
    } catch (error) {
      console.error('Error completing meeting:', error);
      throw error;
    }
  };

  const value = {
    meetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    startMeeting,
    completeMeeting
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
}
