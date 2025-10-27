import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Goals from './pages/Goals';
import Advisors from './pages/Advisors';
import ServiceRequests from './pages/ServiceRequests';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Insights from './pages/Insights';
import AuditLog from './pages/AuditLog';
import Chat from './pages/Chat';
import AccountDetails from './pages/AccountDetails';
import CallCenter from './pages/CallCenter';
import IdentityVerification from './pages/IdentityVerification';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <PrivateRoute>
                <Portfolio />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            }
          />
          <Route
            path="/advisors"
            element={
              <PrivateRoute>
                <Advisors />
              </PrivateRoute>
            }
          />
          <Route
            path="/service-requests"
            element={
              <PrivateRoute>
                <ServiceRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute>
                <Insights />
              </PrivateRoute>
            }
          />
          <Route
            path="/audit-log"
            element={
              <PrivateRoute>
                <AuditLog />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/account/:accountId"
            element={
              <PrivateRoute>
                <AccountDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/call-center"
            element={
              <PrivateRoute>
                <CallCenter />
              </PrivateRoute>
            }
          />
          <Route
            path="/identity-verification"
            element={
              <PrivateRoute>
                <IdentityVerification />
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
