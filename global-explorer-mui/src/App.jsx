import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from './contexts/AuthContext'
import { useContext } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import DestinationDetails from './pages/DestinationDetails'
import Hotels from './pages/Hotels'
import Itinerary from './pages/Itinerary'
import Profile from './pages/Profile'

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext)
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return currentUser ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/destination/:id" element={<PrivateRoute><DestinationDetails /></PrivateRoute>} />
        <Route path="/hotels" element={<PrivateRoute><Hotels /></PrivateRoute>} />
        <Route path="/itinerary" element={<PrivateRoute><Itinerary /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
