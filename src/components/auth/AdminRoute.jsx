import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, token, user } = useAuth();
  const location = useLocation();

  const hasAuth = isAuthenticated || !!user || !!token || !!localStorage.getItem('ep_token');

  if (!hasAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
