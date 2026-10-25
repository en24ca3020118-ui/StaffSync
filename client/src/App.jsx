import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppNavbar from './components/AppNavbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Loader from './components/Loader.jsx';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard.jsx'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard.jsx'));
const HRDashboard = lazy(() => import('./pages/HRDashboard.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Leaves = lazy(() => import('./pages/Leaves.jsx'));
const Announcements = lazy(() => import('./pages/Announcements.jsx'));
const Training = lazy(() => import('./pages/Training.jsx'));
const Team = lazy(() => import('./pages/Team.jsx'));
const Employees = lazy(() => import('./pages/Employees.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        <Suspense fallback={<Loader message="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-Specific Dashboards */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute roles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager"
              element={
                <ProtectedRoute roles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr"
              element={
                <ProtectedRoute roles={['hr']}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Authenticated Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={['employee', 'manager', 'hr']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute roles={['employee', 'manager', 'hr']}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaves"
              element={
                <ProtectedRoute roles={['employee', 'manager', 'hr']}>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute roles={['employee', 'manager', 'hr']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />

            {/* Manager and Employee Training */}
            <Route
              path="/training"
              element={
                <ProtectedRoute roles={['employee', 'manager', 'hr']}>
                  <Training />
                </ProtectedRoute>
              }
            />

            {/* Manager Specific */}
            <Route
              path="/team"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Team />
                </ProtectedRoute>
              }
            />

            {/* HR Specific */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute roles={['hr']}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['hr']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        &copy; {new Date().getFullYear()} Modern HR Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
