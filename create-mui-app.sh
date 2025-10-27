#!/bin/bash

cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/global-explorer-mui-final"

# Create main.jsx
cat > src/main.jsx << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
EOF

# Create AuthContext
cat > src/contexts/AuthContext.jsx << 'EOF'
import { createContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })
    setCurrentUser({ ...userCredential.user, displayName })
    return userCredential
  }

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider)
  }

  const logout = () => {
    return signOut(auth)
  }

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
EOF

# Create App.jsx
cat > src/App.jsx << 'EOF'
import { Routes, Route, Navigate, useContext } from 'react-router-dom'
import { AuthContext, AuthProvider } from './contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'
import Login from './pages/Login'
import Home from './pages/Home'

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext)
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }
  
  return currentUser ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
EOF

echo "All core files created successfully!"
