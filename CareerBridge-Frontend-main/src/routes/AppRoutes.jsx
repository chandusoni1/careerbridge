import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Features / Pages
import { Login, Signup } from '../features/auth';
import { AlumniDirectory } from '../features/directory';
import { Network } from '../features/directory/pages/Network';
import { Jobs } from '../features/jobs';
import { ComprehensiveDashboard, Dashboard, AdminPanel } from '../features/dashboard';
import { Home } from '../features/home/pages/Home';
import { AIStudio } from '../features/ai/pages/AIStudio';
import { Profile } from '../features/profile/pages/Profile';
import { Messages } from '../features/messages/pages/Messages';

export const AppRoutes = ({ user, setUser }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <Login setUser={setUser} />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/home" replace /> : <Signup />}
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute user={user}>
            <Home user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/network"
        element={
          <ProtectedRoute user={user}>
            <Network user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/directory"
        element={
          <ProtectedRoute user={user}>
            <AlumniDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute user={user}>
            <Jobs user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute user={user}>
            <Messages user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user}>
            <Profile user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute user={user}>
            <Profile user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-studio"
        element={
          <ProtectedRoute user={user}>
            <AIStudio user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <ComprehensiveDashboard user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/users"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
