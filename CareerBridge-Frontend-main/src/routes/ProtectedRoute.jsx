import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../stores';

export const ProtectedRoute = ({ children, user: propUser }) => {
  const { user: authUser, loading } = useAuthContext();
  const location = useLocation();

  const user = propUser || authUser;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
