import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sign up with email and password
  async function signup(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      photoURL: userCredential.user.photoURL || null,
      createdAt: new Date().toISOString(),
      role: 'user'
    });

    return userCredential;
  }

  // Sign in with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign in with Google
  async function signInWithGoogle() {
    const userCredential = await signInWithPopup(auth, googleProvider);

    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
    }

    return userCredential;
  }

  // Sign out
  function logout() {
    // Clear demo mode if active
    if (isDemoMode) {
      localStorage.removeItem('demoMode');
      setIsDemoMode(false);
      setCurrentUser(null);
      setUserProfile(null);
      return Promise.resolve();
    }
    return signOut(auth);
  }

  // Demo mode login
  function loginDemoMode() {
    const demoUser = {
      uid: 'demo-user-id',
      email: 'demo@projecthub.com',
      displayName: 'Demo User',
      photoURL: null
    };

    const demoProfile = {
      uid: 'demo-user-id',
      email: 'demo@projecthub.com',
      displayName: 'Demo User',
      photoURL: null,
      role: 'demo',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
    setIsDemoMode(true);
    localStorage.setItem('demoMode', 'true');

    return Promise.resolve({ user: demoUser });
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  useEffect(() => {
    // Check if demo mode is active from localStorage
    const demoModeActive = localStorage.getItem('demoMode') === 'true';

    if (demoModeActive) {
      // Restore demo mode session
      loginDemoMode().then(() => {
        setLoading(false);
      });
    } else {
      // Normal Firebase auth
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          await fetchUserProfile(user.uid);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    signInWithGoogle,
    loginDemoMode,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
