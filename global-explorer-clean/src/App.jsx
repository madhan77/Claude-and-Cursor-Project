import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import DestinationDetails from './pages/DestinationDetails';
import Hotels from './pages/Hotels';
import Itinerary from './pages/Itinerary';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
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
                  <DestinationDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/hotels"
              element={
                <PrivateRoute>
                  <Hotels />
                </PrivateRoute>
              }
            />
            <Route
              path="/itinerary"
              element={
                <PrivateRoute>
                  <Itinerary />
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
            <Route path="*" element={<Navigate to="/" replace />} />
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
            theme="light"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
