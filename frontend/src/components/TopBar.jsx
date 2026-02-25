import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBar from "./NotificationBar";
import "../styles/TopBar.css";

const OWNER_EMAIL = "admin@mediflow.com";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const firstName = user?.name?.split(" ")[0] || "User";
  const role = location.pathname.startsWith("/admin")
    ? "Admin"
    : (user?.role === "Provider" || user?.email === OWNER_EMAIL ? "Emergency Coordinator" : "User");

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-greeting-avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="topbar-greeting-info">
          <p className="topbar-greeting">{getGreeting()}, <strong>{firstName}</strong></p>
          <span className="topbar-role">{role}</span>
        </div>
      </div>
      <div className="topbar-right">
        <NotificationBar />
        <div className="topbar-profile-container">
          <div
            className={`topbar-profile-pill ${isExpanded ? "active" : ""}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="topbar-profile-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>

          {isExpanded && (
            <>
              <div className="profile-dropdown-backdrop" onClick={() => setIsExpanded(false)} />
              <div className="profile-dropdown-card">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-dropdown-info">
                    <h4 className="profile-full-name">{user?.name || "User Name"}</h4>
                    <span className="profile-role-badge">{role}</span>
                  </div>
                </div>
                <div className="profile-dropdown-body">
                  <div className="profile-detail-item">
                    <label>Email</label>
                    <p>{user?.email || "No email provided"}</p>
                  </div>
                  <div className="profile-detail-item">
                    <label>Phone Number</label>
                    <p>{user?.phone || "+91 98765 43210"}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
