import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OWNER_EMAIL = "admin@mediflow.com";

export default function ProtectedRoute({ children, requireAdmin, requireProvider }) {
  const { isAuthenticated, user, sessionExpired } = useAuth();
  const location = useLocation();

  if (sessionExpired) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "Session expired. Please log in again." }}
        replace
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOwner = user?.email === OWNER_EMAIL;

  if (requireAdmin && user?.role !== "Admin" && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireProvider && !["Admin", "Provider"].includes(user?.role) && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
