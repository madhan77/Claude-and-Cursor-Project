import { useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const FirestoreTest = () => {
  useEffect(() => {
    const testFirestore = async () => {
      console.log('=== FIRESTORE CONNECTION TEST ===');
      console.log('Auth user:', auth.currentUser);
      console.log('Auth user ID:', auth.currentUser?.uid);

      try {
        console.log('Attempting to read tasks collection...');
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef);

        const snapshot = await getDocs(q);
        console.log('SUCCESS! Read tasks. Count:', snapshot.docs.length);

        snapshot.docs.forEach(doc => {
          console.log('Task:', doc.id, doc.data());
        });
      } catch (error) {
        console.error('FIRESTORE READ ERROR:');
        console.error('Error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
      }
    };

    if (auth.currentUser) {
      testFirestore();
    } else {
      console.log('No authenticated user - waiting...');
      setTimeout(() => {
        if (auth.currentUser) {
          testFirestore();
        }
      }, 2000);
    }
  }, []);

  return <div style={{ display: 'none' }}>Firestore Test Running...</div>;
};

export default FirestoreTest;
