import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import PlayerDashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import TournamentManagementPage from './pages/admin/TournamentManagementPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import { TrophyIcon } from '@patternfly/react-icons';

// Dashboard wrapper to handle role-based routing
const DashboardWrapper = () => {
  const { profile } = useAuth();

  if (profile?.role === 'admin') {
    const adminNavItems = [
      { path: '/admin/tournaments', label: 'Tournaments', icon: <TrophyIcon /> },
    ];

    return (
      <Layout navItems={adminNavItems}>
        <AdminDashboard />
      </Layout>
    );
  }

  const playerNavItems = [
    { path: '/dashboard', label: 'Tournaments', icon: <TrophyIcon /> },
  ];

  return (
    <Layout navItems={playerNavItems}>
      <PlayerDashboard />
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/tournaments"
            element={
              <ProtectedRoute adminOnly>
                <Layout navItems={[
                  { path: '/admin/tournaments', label: 'Tournaments', icon: <TrophyIcon /> },
                ]}>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tournaments/:id"
            element={
              <ProtectedRoute adminOnly>
                <Layout navItems={[
                  { path: '/admin/tournaments', label: 'Tournaments', icon: <TrophyIcon /> },
                ]}>
                  <TournamentManagementPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

