import { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from './contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import DestinationDetail from './pages/DestinationDetail'
import Profile from './pages/Profile'
import MyTrips from './pages/MyTrips'
import MyBookmarks from './pages/MyBookmarks'

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
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
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/destination/:id"
          element={
            <PrivateRoute>
              <DestinationDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <PrivateRoute>
              <MyTrips />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <PrivateRoute>
              <MyBookmarks />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
