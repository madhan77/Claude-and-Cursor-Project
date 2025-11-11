import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6_fltxzke20VBf3U67Nmau0N6JawIjTQ",
  authDomain: "claude-project-10b09.firebaseapp.com",
  projectId: "claude-project-10b09",
  storageBucket: "claude-project-10b09.firebasestorage.app",
  messagingSenderId: "998432816875",
  appId: "1:998432816875:web:24a231fcfa8cccd5efc8ae",
  measurementId: "G-XXEWGC4KNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
