import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6_fltxzke20VBf3U67Nmau0N6JawIjTQ",
  authDomain: "claude-project-10b09.firebaseapp.com",
  projectId: "claude-project-10b09",
  storageBucket: "claude-project-10b09.firebasestorage.app",
  messagingSenderId: "998432816875",
  appId: "1:998432816875:web:33189310568b759341285e"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
