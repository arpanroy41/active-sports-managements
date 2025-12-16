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
  const { isAdmin } = useAuth();

  // Define navigation items based on role (function call pattern like meal-booking)
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { path: '/admin/tournaments', label: 'Tournaments', icon: <TrophyIcon /> },
      ];
    }
    
    // Player navigation
    return [
      { path: '/dashboard', label: 'Tournaments', icon: <TrophyIcon /> },
    ];
  };

  // Define dashboard component based on role
  const getDashboardComponent = () => {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    return <PlayerDashboard />;
  };

  return (
    <Layout navItems={getNavItems()}>
      {getDashboardComponent()}
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
};

export default App;

