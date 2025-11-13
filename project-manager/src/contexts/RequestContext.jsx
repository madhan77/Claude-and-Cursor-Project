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

const RequestContext = createContext({});

export const useRequests = () => useContext(RequestContext);

export function RequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isDemoMode } = useAuth();

  // Fetch requests
  useEffect(() => {
    if (!currentUser) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // Fetch all requests, filter client-side for demo mode (no index needed)
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter client-side for demo mode
      if (isDemoMode) {
        requestsData = requestsData.filter(r => r.createdBy === 'demo-user-id');
      }

      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching requests:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, isDemoMode]);

  // Fetch change requests
  useEffect(() => {
    if (!currentUser) {
      setChangeRequests([]);
      return;
    }

    // Fetch all change requests, filter client-side for demo mode (no index needed)
    const q = query(collection(db, 'changeRequests'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let changeRequestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter client-side for demo mode
      if (isDemoMode) {
        changeRequestsData = changeRequestsData.filter(cr => cr.createdBy === 'demo-user-id');
      }

      setChangeRequests(changeRequestsData);
    }, (error) => {
      console.error('Error fetching change requests:', error);
    });

    return unsubscribe;
  }, [currentUser, isDemoMode]);

  async function createRequest(requestData) {
    try {
      const newRequest = {
        ...requestData,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'requests'), newRequest);
      toast.success('Request created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
      throw error;
    }
  }

  async function updateRequest(requestId, updates) {
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Request updated successfully!');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
      throw error;
    }
  }

  async function deleteRequest(requestId) {
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      toast.success('Request deleted successfully!');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
      throw error;
    }
  }

  async function createChangeRequest(changeRequestData) {
    try {
      const newChangeRequest = {
        ...changeRequestData,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'changeRequests'), newChangeRequest);
      toast.success('Change Request created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating change request:', error);
      toast.error('Failed to create change request');
      throw error;
    }
  }

  async function updateChangeRequest(changeRequestId, updates) {
    try {
      const changeRequestRef = doc(db, 'changeRequests', changeRequestId);
      await updateDoc(changeRequestRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Change Request updated successfully!');
    } catch (error) {
      console.error('Error updating change request:', error);
      toast.error('Failed to update change request');
      throw error;
    }
  }

  async function deleteChangeRequest(changeRequestId) {
    try {
      await deleteDoc(doc(db, 'changeRequests', changeRequestId));
      toast.success('Change Request deleted successfully!');
    } catch (error) {
      console.error('Error deleting change request:', error);
      toast.error('Failed to delete change request');
      throw error;
    }
  }

  const value = {
    requests,
    changeRequests,
    loading,
    createRequest,
    updateRequest,
    deleteRequest,
    createChangeRequest,
    updateChangeRequest,
    deleteChangeRequest
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
}
