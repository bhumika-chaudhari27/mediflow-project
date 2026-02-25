import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RequestHelp from "./pages/RequestHelp";
import HomeDashboard from "./pages/HomeDashboard";
import Blood from "./pages/Blood";
import Medicine from "./pages/Medicine";
import Equipment from "./pages/Equipment";
import Alerts from "./pages/Alerts";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminDonations from "./pages/admin/AdminDonations";
import HelpCenter from "./pages/HelpCenter";
import Donate from "./pages/Donate";
import UserList from "./components/UserList";
import MyRequests from "./pages/MyRequests";
import HealthTips from "./pages/HealthTips";
import Profile from "./pages/Profile";

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();
  const redirectPath = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/request-help" element={<RequestHelp />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? redirectPath : "/login"} replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<HomeDashboard />} />
        <Route path="blood" element={<Blood />} />
        <Route path="medicine" element={<Medicine />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="alerts" element={<ProtectedRoute requireProvider><Alerts /></ProtectedRoute>} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="profile" element={<Profile />} />
        <Route path="donate" element={<Donate />} />
        <Route path="health-tips" element={<HealthTips />} />
        <Route path="help" element={<HelpCenter />} />
        <Route path="users-test" element={<UserList />} />
        <Route path="donation-requests" element={<ProtectedRoute requireProvider><AdminDonations /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute requireProvider><AdminInventory /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute requireProvider><Admin /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
          <Route path="logs" element={<ProtectedRoute requireAdmin><AdminLogs /></ProtectedRoute>} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
