import React from "react";
import { Navigate, useLocation , Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  /* wait until auth resolves */
  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  /* not logged in */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* admin gate */
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  /* 🔥 CRITICAL LINE */
  return <Outlet />;
}