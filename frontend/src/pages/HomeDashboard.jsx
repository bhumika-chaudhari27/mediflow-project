import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTint, FaPills, FaExclamationTriangle, FaCogs, FaArrowRight, FaBell, FaHospital, FaHeartbeat, FaChartBar, FaUser, FaPhone, FaClipboardList, FaLightbulb } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { inventoryApi, bloodBankApi, dashboardApi } from "../services/api";
import StatCard from "../components/StatCard";
import "../styles/Dashboard.css";

// Quick links for Providers/Admins (inventory-focused)
const PROVIDER_QUICK_LINKS = [
  { to: "/blood", icon: FaTint, label: "Blood Availability", desc: "View blood types & stock" },
  { to: "/medicine", icon: FaPills, label: "Medicine", desc: "Search & monitor stock" },
  { to: "/equipment", icon: FaCogs, label: "Equipment", desc: "Device status" },
  { to: "/alerts", icon: FaExclamationTriangle, label: "Monitor Center", desc: "Active alerts" },
  { to: "/request-help", icon: FaHospital, label: "Request Help", desc: "Emergency assistance" },
];

// Quick links for regular Users (patient-focused)
const USER_QUICK_LINKS = [
  { to: "/requests", icon: FaClipboardList, label: "My Requests", desc: "Track your help requests" },
  { to: "/request-help", icon: FaHospital, label: "Request Help", desc: "Emergency assistance" },
  { to: "/donate", icon: FaHeartbeat, label: "Donate Blood", desc: "Register to save lives" },
  { to: "/health-tips", icon: FaLightbulb, label: "Health Tips", desc: "Stay healthy & informed" },
];

export default function HomeDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "User";
  const isProviderOrAdmin = ["Admin", "Provider"].includes(user?.role);

  const [stats, setStats] = useState({ blood: 0, medicine: 0, equipment: 0, alerts: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Profile completeness for Users
  const profileComplete = user?.bloodGroup && user?.phone;

  useEffect(() => {
    if (!isProviderOrAdmin) return; // Users don't need inventory data

    const fetchData = async () => {
      try {
        const [medicines, equipment, bloodBags, alerts] = await Promise.all([
          inventoryApi.getByCategory('Medicine'),
          inventoryApi.getByCategory('Equipment'),
          bloodBankApi.getAll(),
          dashboardApi.getAlerts()
        ]);
        const bloodUnits = bloodBags ? bloodBags.reduce((acc, curr) => acc + (curr.quantity || 0), 0) : 0;
        setStats({
          medicine: medicines ? medicines.length : 0,
          equipment: equipment ? equipment.length : 0,
          blood: bloodUnits,
          alerts: alerts ? alerts.filter(a => !a.isResolved).length : 0
        });
        if (alerts) setRecentAlerts(alerts.filter(a => !a.isResolved).slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchData();
  }, [isProviderOrAdmin]);

  const quickLinks = isProviderOrAdmin ? PROVIDER_QUICK_LINKS : USER_QUICK_LINKS;

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, {firstName} <span className="wave">👋</span></h1>
          <p>
            {isProviderOrAdmin
              ? "Orchestrating regional health resources with real-time intelligence and community-focused coordination."
              : "Your health companion — request help, track your requests, and stay informed."}
          </p>
        </div>
      </div>

      {/* Profile completion banner for regular users */}
      {!isProviderOrAdmin && !profileComplete && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          background: "#fffbeb", border: "1px solid #fbbf24",
          borderRadius: "12px", padding: "14px 20px", marginBottom: "20px",
          fontSize: "0.9rem", color: "#92400e"
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <span>
            Your health profile is incomplete — adding your <strong>blood group</strong> and <strong>phone number</strong> helps coordinators respond faster.
          </span>
          <Link to="/profile" style={{
            marginLeft: "auto", background: "#f59e0b", color: "white",
            padding: "6px 16px", borderRadius: "8px", textDecoration: "none",
            fontWeight: 600, whiteSpace: "nowrap", fontSize: "0.85rem"
          }}>
            Complete Profile →
          </Link>
        </div>
      )}

      <section className="dashboard-cards" aria-label="Overview">
        {isProviderOrAdmin ? (
          <>
            <StatCard title="Blood Units Available" value={`${stats.blood} Units`} icon={<FaTint />} />
            <StatCard title="Medicines Available" value={`${stats.medicine} Items`} icon={<FaPills />} />
            <StatCard title="Equipment Available" value={`${stats.equipment} Devices`} icon={<FaCogs />} />
            <StatCard title="Active Alerts" value={`${stats.alerts} Cases`} icon={<FaExclamationTriangle />} />
          </>
        ) : (
          <>
            {/* Health Card for regular users */}
            <div className="stat-card" style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaUser /></div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>My Health Profile</h3>
                <Link to="/profile" style={{
                  marginLeft: "auto", fontSize: "0.8rem", color: "#0284c7",
                  background: "#e0f2fe", padding: "4px 12px", borderRadius: "20px",
                  textDecoration: "none", fontWeight: 600
                }}>
                  ✏️ Edit Profile
                </Link>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ background: "#f1f5f9", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", color: "#475569" }}>
                  🩸 Blood Group: <strong>{user?.bloodGroup || "Not set"}</strong>
                </span>
                <span style={{ background: "#f1f5f9", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", color: "#475569" }}>
                  <FaPhone size={11} /> Phone: <strong>{user?.phone || "Not set"}</strong>
                </span>
              </div>
            </div>
            {/* Become a Donor card */}
            <div className="stat-card" style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", cursor: "pointer" }}>
              <Link to="/donate" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
                <div className="stat-icon" style={{ background: "rgba(255,255,255,0.5)", color: "#d63031" }}><FaHeartbeat /></div>
                <div className="stat-info">
                  <h3>Become a Donor</h3>
                  <p style={{ fontSize: "0.9rem", margin: 0 }}>Register to save lives ❤️</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="dashboard-quick-links">
        <h2 className="section-title">Quick links</h2>
        <p className="section-desc">Jump to a module from the sidebar or use the links below.</p>
        <div className="quick-links-grid">
          {quickLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="quick-link-card">
              <div className="quick-link-icon-wrapper">
                <Icon className="quick-link-icon" />
              </div>
              <div className="quick-link-content">
                <strong>{label}</strong>
                <span>{desc}</span>
              </div>
              <div className="quick-link-footer">
                <FaArrowRight className="quick-link-arrow" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="dashboard-bottom">
        <section className="dashboard-section">
          <h2 className="section-title">
            {isProviderOrAdmin ? "System Insights" : "Did you know?"}
          </h2>
          <div className="insight-panel">
            <div className="insight-icon"><FaChartBar /></div>
            <div className="insight-text">
              <p>
                {isProviderOrAdmin
                  ? "The dashboard integrates data from our Blood Bank, Pharmacy, and Emergency Response modules to provide a unified view of regional healthcare readiness."
                  : "Blood donors can donate every 56 days. A single donation can save up to 3 lives. Register as a donor to make a difference in your community."}
              </p>
            </div>
          </div>
        </section>

        {isProviderOrAdmin && (
          <section className="dashboard-section dashboard-alerts-preview">
            <h2 className="section-title">
              <FaBell />
              Recent alerts
            </h2>
            {recentAlerts.length > 0 ? (
              <ul className="recent-alerts-list">
                {recentAlerts.map((alert) => (
                  <li key={alert._id} className={`recent-alert-item priority-${alert.priority ? alert.priority.toLowerCase() : 'high'}`}>
                    <span className="recent-alert-text">{alert.message || alert.text}</span>
                    <span className="recent-alert-meta">{new Date(alert.createdAt || Date.now()).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#666", padding: "1rem" }}>No active alerts.</p>
            )}
            <Link to="/alerts" className="dashboard-view-all">View all alerts</Link>
          </section>
        )}
      </div>
    </div>
  );
}
