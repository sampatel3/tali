import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './shared/store/authStore';

// Pages from features
import Onboarding from './features/auth/pages/Onboarding';
import UAEPassCallback from './features/auth/pages/UAEPassCallback';
import Dashboard from './features/dashboard/pages/Dashboard';
import Transactions from './features/transactions/pages/Transactions';
import Subscriptions from './features/subscriptions/pages/Subscriptions';
import SubscriptionDetail from './features/subscriptions/pages/SubscriptionDetail';
import Loyalty from './features/loyalty/pages/Loyalty';
import LoyaltyDetail from './features/loyalty/pages/LoyaltyDetail';
import Analytics from './features/analytics/pages/Analytics';
import Settings from './features/settings/pages/Settings';

// Shared components
import PrivateRoute from './shared/components/PrivateRoute';
import Layout from './shared/components/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/uaepass/callback" element={<UAEPassCallback />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="loyalty" element={<Loyalty />} />
            <Route path="loyalty/:id" element={<LoyaltyDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/onboarding"} replace />} />
        </Routes>
      </Router>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
