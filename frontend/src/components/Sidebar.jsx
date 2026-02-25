import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTint,
  FaPills,
  FaUserMd,
  FaBars,
  FaSignOutAlt,
  FaHome,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaHospital,
  FaUsers,
  FaBoxes,
  FaClipboardList,
  FaHeartbeat
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const OWNER_EMAIL = "admin@mediflow.com";




export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth > 900) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 900) {
      setIsOpen(false);
    }
  };

  const mainNavItems = [
    { to: "/dashboard", icon: FaHome, label: "Home", roles: ["all"] },
    { to: "/blood", icon: FaTint, label: "Blood Availability", roles: ["Provider", "Admin"] },
    { to: "/medicine", icon: FaPills, label: "Medicine Availability", roles: ["Provider", "Admin"] },
    { to: "/equipment", icon: FaUserMd, label: "Equipment Status", roles: ["Provider", "Admin"] },
    { to: "/health-tips", icon: FaUserMd, label: "Health Tips", roles: ["all"] },

    { label: "Help & Support", isHeader: true, roles: ["all"] },
    { to: "/requests", icon: FaQuestionCircle, label: "My Requests", roles: ["User"] },
    { to: "/request-help", icon: FaHospital, label: "Request Help", roles: ["User"] },
    { to: "/help", icon: FaQuestionCircle, label: "Help Center", roles: ["all"] },

    { label: "Emergency Coordination", isHeader: true, roles: ["Provider", "Admin"] },
    { to: "/inventory", icon: FaBoxes, label: "Inventory Manager", roles: ["Provider", "Admin"] },
    { to: "/alerts", icon: FaExclamationTriangle, label: "Critical Alerts", roles: ["Provider", "Admin"] },
    { to: "/donation-requests", icon: FaHeartbeat, label: "Donation Requests", roles: ["Provider", "Admin"] },

    { label: "Resource Management", isHeader: true, roles: ["all"], ownerOnly: true },
    { to: "/admin/dashboard", icon: FaHome, label: "Admin Dashboard", roles: ["all"], ownerOnly: true },
    { to: "/admin/users", icon: FaUsers, label: "Users", roles: ["all"], ownerOnly: true },
    { to: "/admin/logs", icon: FaClipboardList, label: "Logs", roles: ["all"], ownerOnly: true },
  ];

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Collapse menu" : "Expand menu"}
      >
        <FaBars />
      </button>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <NavLink to="/dashboard" className="sidebar-logo">
          <FaHeartbeat className="logo-icon" />
          <span className="logo-text">MediFlow</span>
        </NavLink>

        <nav className="sidebar-nav">
          <ul className="menu">
            {mainNavItems
              .filter(item => {
                const hasRole = item.roles.includes("all") || item.roles.includes(user?.role);
                const isOwnerMatch = !item.ownerOnly || user?.email === OWNER_EMAIL;
                return hasRole && isOwnerMatch;
              })
              .map((item, index) => (
                item.isHeader ? (
                  <li key={`header-${index}`} className="menu-header">
                    <span className="menu-label">{item.label}</span>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
                      end={item.to === "/dashboard"}
                    >
                      <item.icon />
                      <span className="menu-label">{item.label}</span>
                    </NavLink>
                  </li>
                )
              ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || "User"}</span>
              <span className="sidebar-user-role">
                {pathname.startsWith("/admin")
                  ? "Admin"
                  : (user?.role === "Provider" || user?.email === OWNER_EMAIL ? "Emergency Coordinator" : "User")}
              </span>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span className="menu-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
