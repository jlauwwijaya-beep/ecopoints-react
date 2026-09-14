import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DepositsIndexPage from './pages/DepositsIndexPage';
import DepositsCreatePage from './pages/DepositsCreatePage';
import PointsPage from './pages/PointsPage';
import RewardsPage from './pages/RewardsPage';
import AdminDepositsPage from './pages/admin/AdminDepositsPage';
import AdminManagementPage from './pages/admin/AdminManagementPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRoute from './components/auth/AdminRoute';
import PetugasRoute from './components/auth/PetugasRoute';
import PetugasScanPage from './pages/petugas/PetugasScanPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposits"
            element={
              <ProtectedRoute>
                <DepositsIndexPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposits/create"
            element={
              <ProtectedRoute>
                <DepositsCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/points"
            element={
              <ProtectedRoute>
                <PointsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminManagementPage section="overview" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/deposits"
            element={
              <AdminRoute>
                <AdminDepositsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/points"
            element={
              <AdminRoute>
                <AdminManagementPage section="points" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rewards"
            element={
              <AdminRoute>
                <AdminManagementPage section="rewards" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/redemptions"
            element={
              <AdminRoute>
                <AdminManagementPage section="redemptions" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminManagementPage section="reports" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />

          {/* Petugas Routes */}
          <Route
            path="/petugas/scan"
            element={
              <PetugasRoute>
                <PetugasScanPage />
              </PetugasRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}