import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const FeatureContext = createContext({});

export const useFeatures = () => useContext(FeatureContext);

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setFeatures([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'features'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const featuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeatures(featuresData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching features:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  async function createFeature(featureData) {
    try {
      const newFeature = {
        ...featureData,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'features'), newFeature);
      toast.success('Feature created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating feature:', error);
      toast.error('Failed to create feature');
      throw error;
    }
  }

  async function updateFeature(featureId, updates) {
    try {
      const featureRef = doc(db, 'features', featureId);
      await updateDoc(featureRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Feature updated successfully!');
    } catch (error) {
      console.error('Error updating feature:', error);
      toast.error('Failed to update feature');
      throw error;
    }
  }

  async function deleteFeature(featureId) {
    try {
      await deleteDoc(doc(db, 'features', featureId));
      toast.success('Feature deleted successfully!');
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
      throw error;
    }
  }

  const value = {
    features,
    loading,
    createFeature,
    updateFeature,
    deleteFeature
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}
