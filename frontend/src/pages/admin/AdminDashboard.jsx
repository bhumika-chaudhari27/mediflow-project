import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaUserShield, FaUserNurse, FaExclamationTriangle, FaHeartbeat } from "react-icons/fa";
import StatCard from "../../components/StatCard";
import { adminApi } from "../../services/api";
import "../../styles/Dashboard.css";
import "../../styles/AdminPanel.css";

function formatTimestamp(ts) {
  if (!ts) return "Unknown";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "Unknown";
  }
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setError("");
    adminApi
      .getOverview()
      .then((data) => mounted && setOverview(data))
      .catch((e) => mounted && setError(e?.message || "Failed to load admin overview"));
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const o = overview || {};
    return {
      usersTotal: o.usersTotal ?? 0,
      providersTotal: o.providersTotal ?? 0,
      adminsTotal: o.adminsTotal ?? 0,
      activeAlerts: o.activeAlerts ?? 0,
      lastUpdated: o.lastUpdated || o.lastSync || null,
    };
  }, [overview]);

  return (
    <section className="admin-section" aria-label="Admin dashboard">
      {error ? <div className="admin-callout error">{error}</div> : null}

      <div className="dashboard-hero" style={{ borderRadius: "24px", marginBottom: "2rem" }}>
        <div className="hero-content">
          <h1>
            <FaHeartbeat className="logo-icon heartbeat" style={{ fontSize: '2rem', display: 'inline-block', verticalAlign: 'middle', marginRight: '15px' }} />
            System Control & Operations
          </h1>
          <p>MediFlow's administrative suite empowers system owners to orchestrate emergency responses, optimize resource allocation, and maintain platform integrity.</p>
        </div>
      </div>

      {!overview ? (
        <div className="admin-callout">Loading admin metrics…</div>
      ) : (
        <>
          <section className="dashboard-cards" aria-label="Admin overview">
            <StatCard title="Total Users" value={`${stats.usersTotal}`} icon={<FaUsers />} />
            <StatCard title="Emergency Coordinators" value={`${stats.providersTotal}`} icon={<FaUserNurse />} />
            <StatCard title="Admins" value={`${stats.adminsTotal}`} icon={<FaUserShield />} />
            <StatCard title="Active Alerts" value={`${stats.activeAlerts}`} icon={<FaExclamationTriangle />} type="danger" />
          </section>

          <div className="admin-guidelines admin-card" style={{ marginBottom: '2rem', borderLeft: '4px solid #06B6D4' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A' }}>
              <FaUserShield className="text-primary" /> Administrative Governance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: '600' }}>Operational Objectives</h4>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                  This interface provides high-level oversight of the MediFlow ecosystem. Focus on maintaining data accuracy across inventory modules and ensuring optimal response times for critical alerts.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: '600' }}>Operational Protocol</h4>
                <ul style={{ fontSize: '0.9rem', color: '#475569', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.8' }}>
                  <li>Perform weekly reconciliations of critical medical inventories.</li>
                  <li>Audit system logs for unusual access patterns or data inconsistencies.</li>
                  <li>Monitor coordinator response times for "Critical" priority alerts.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="resource-summary" style={{ border: 'none', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
            <span className="resource-summary-item">
              <strong style={{ color: '#0F172A' }}>Platform Security:</strong> Multi-layer protection active
            </span>
            <span className="resource-summary-dot" aria-hidden />
            <span className="resource-summary-item">
              <strong style={{ color: '#0F172A' }}>System Audit:</strong> Operational logging enabled
            </span>
            <span className="resource-summary-meta">Sync status: {formatTimestamp(stats.lastUpdated)}</span>
          </div>
        </>
      )}
    </section>
  );
}

