import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Get the access token for Google APIs
        const token = await user.getIdToken();
        setAccessToken(token);

        // Store user info
        localStorage.setItem('googleAccessToken', token);
      } else {
        setAccessToken(null);
        localStorage.removeItem('googleAccessToken');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      // Get OAuth access token
      const credential = result._tokenResponse;
      const googleAccessToken = credential.oauthAccessToken;

      // Store the Google OAuth token for API calls
      localStorage.setItem('googleOAuthToken', googleAccessToken);

      toast.success('Successfully signed in with Google!');
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error(`Sign in failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('googleAccessToken');
      localStorage.removeItem('googleOAuthToken');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Sign out failed');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    accessToken,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
