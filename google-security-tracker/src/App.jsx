import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SecurityReport from './pages/SecurityReport';
import GmailAnalysis from './pages/GmailAnalysis';
import DriveAnalysis from './pages/DriveAnalysis';
import YouTubeAnalysis from './pages/YouTubeAnalysis';
import CalendarAnalysis from './pages/CalendarAnalysis';
import Settings from './pages/Settings';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Private Route wrapper
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="report" element={<SecurityReport />} />
        <Route path="gmail" element={<GmailAnalysis />} />
        <Route path="drive" element={<DriveAnalysis />} />
        <Route path="youtube" element={<YouTubeAnalysis />} />
        <Route path="calendar" element={<CalendarAnalysis />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
