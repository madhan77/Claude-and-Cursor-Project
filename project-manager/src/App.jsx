import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TaskProvider } from './contexts/TaskContext';
import { EpicProvider } from './contexts/EpicContext';
import { FeatureProvider } from './contexts/FeatureContext';
import { StoryProvider } from './contexts/StoryContext';
import { SprintProvider } from './contexts/SprintContext';
import { RequestProvider } from './contexts/RequestContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Epics from './pages/Epics';
import Features from './pages/Features';
import Stories from './pages/Stories';
import Sprints from './pages/Sprints';
import SprintBoard from './pages/SprintBoard';
import SprintKanban from './pages/SprintKanban';
import Requests from './pages/Requests';

// Components
import PrivateRoute from './components/PrivateRoute';

// Main Application Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <EpicProvider>
              <FeatureProvider>
                <StoryProvider>
                  <SprintProvider>
                    <RequestProvider>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Private Routes */}
                        <Route
                          path="/dashboard"
                          element={
                            <PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/projects"
                          element={
                            <PrivateRoute>
                              <Projects />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/projects/:id"
                          element={
                            <PrivateRoute>
                              <ProjectDetail />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/tasks"
                          element={
                            <PrivateRoute>
                              <Tasks />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/calendar"
                          element={
                            <PrivateRoute>
                              <Calendar />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/epics"
                          element={
                            <PrivateRoute>
                              <Epics />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/features"
                          element={
                            <PrivateRoute>
                              <Features />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/stories"
                          element={
                            <PrivateRoute>
                              <Stories />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/sprints"
                          element={
                            <PrivateRoute>
                              <Sprints />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/sprint-board"
                          element={
                            <PrivateRoute>
                              <SprintBoard />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/sprint-kanban"
                          element={
                            <PrivateRoute>
                              <SprintKanban />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/requests"
                          element={
                            <PrivateRoute>
                              <Requests />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/team"
                          element={
                            <PrivateRoute>
                              <Team />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <PrivateRoute>
                              <Settings />
                            </PrivateRoute>
                          }
                        />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>

                      {/* Toast Notifications */}
                      <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                      />
                    </RequestProvider>
                  </SprintProvider>
                </StoryProvider>
              </FeatureProvider>
            </EpicProvider>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
