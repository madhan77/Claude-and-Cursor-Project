import { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from './contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'
import Login from './pages/Login'
import Home from './pages/Home'
import DestinationDetail from './pages/DestinationDetail'

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
        <Route path="/destination/:id" element={<PrivateRoute><DestinationDetail /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
