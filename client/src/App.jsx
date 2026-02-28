import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './hooks/useSubscription';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Analyzer    from './pages/Analyzer';
import Admin       from './pages/Admin';
import Profile     from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Generator   from './pages/Generator';
import Pricing     from './pages/Pricing';

export default function App() {
  const { isAuthenticated } = useAuth();
  return (
    <SubscriptionProvider>
    <Routes>
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analyzer"    element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
      <Route path="/admin"       element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/generator"   element={<ProtectedRoute><Generator /></ProtectedRoute>} />
      <Route path="/pricing"     element={<Pricing />} />
      <Route path="*"            element={<Navigate to="/" />} />
    </Routes>
    </SubscriptionProvider>
  );
}
