import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    // Simulate Firebase signup
    const user = {
      uid: `demo_${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
    };
    localStorage.setItem('demoUser', JSON.stringify(user));
    setCurrentUser(user);
    return { user };
  };

  // Sign in with email and password
  const login = async (email, password) => {
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    const userKey = email.toLowerCase();

    if (users[userKey] && users[userKey].password === password) {
      const user = users[userKey].user;
      localStorage.setItem('demoUser', JSON.stringify(user));
      setCurrentUser(user);
      return { user };
    } else {
      // For demo, auto-create user if not exists
      const user = {
        uid: `demo_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      users[userKey] = { user, password };
      localStorage.setItem('demoUsers', JSON.stringify(users));
      localStorage.setItem('demoUser', JSON.stringify(user));
      setCurrentUser(user);
      return { user };
    }
  };

  // Sign in with Google (demo)
  const loginWithGoogle = async () => {
    const user = {
      uid: `demo_google_${Date.now()}`,
      email: 'demo@google.com',
      displayName: 'Demo User',
      photoURL: null,
    };
    localStorage.setItem('demoUser', JSON.stringify(user));
    setCurrentUser(user);
    return { user };
  };

  // Sign out
  const logout = async () => {
    localStorage.removeItem('demoUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
