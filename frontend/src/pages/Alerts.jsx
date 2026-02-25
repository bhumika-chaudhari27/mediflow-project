import { useState, useEffect } from "react";
import { FaExclamationTriangle, FaTint, FaPills, FaCogs, FaAmbulance, FaPhone, FaTrash, FaEnvelope, FaMapMarkerAlt, FaUser, FaBroadcastTower, FaUserMd } from "react-icons/fa";
import { dashboardApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/ResourceModule.css";

const iconMap = {
  Blood: FaTint,
  Medicine: FaPills,
  Equipment: FaCogs,
  Ambulance: FaAmbulance
};

export default function Alerts() {
  const { user, isProvider } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("emergency");

  useEffect(() => {
    // Coordinators (Provider role) only see their assigned alerts
    const coordinatorId = isProvider ? (user?.id || user?._id) : null;

    const fetchAlerts = () => {
      dashboardApi.getAlerts(coordinatorId)
        .then(data => {
          if (Array.isArray(data)) setAlerts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch alerts", err);
          setLoading(false);
        });
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [isProvider, user]);

  const updateStatus = async (id, newStatus) => {
    try {
      await dashboardApi.updateAlertStatus(id, newStatus);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      await dashboardApi.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Failed to delete alert", err);
      alert("Failed to delete alert");
    }
  };

  const emergencyAlerts = alerts.filter(a => a.category !== 'Donation' && a.category !== 'System');
  const notificationAlerts = alerts.filter(a => a.category === 'Donation' || a.category === 'System');

  const pendingAlerts = emergencyAlerts.filter(a => !a.status || a.status === 'Pending');
  const activeAlerts = emergencyAlerts.filter(a => ['Accepted', 'Ambulance Dispatched', 'Arrived'].includes(a.status));
  const resolvedAlerts = emergencyAlerts.filter(a => a.status === 'Resolved' || a.status === 'Rejected');

  const renderAlertCard = (alert) => {
    const Icon = iconMap[alert.category] || FaExclamationTriangle;
    const isTargetedToMe = alert.targetCoordinatorId && isProvider;
    const isBroadcast = alert.targetAll;

    return (
      <li key={alert._id} className={`alert-item priority-${(alert.priority || 'high').toLowerCase()}`}>
        <div className="alert-header-grouped">
          <div className="alert-icon">
            <Icon />
          </div>
          <div className="alert-header-row">
            <div className="alert-title-group">
              <strong>{alert.message || alert.title}</strong>
              <button
                className="delete-item-btn"
                onClick={() => handleDeleteAlert(alert._id)}
                title="Delete Alert"
              >
                <FaTrash />
              </button>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              <span className={`alert-badge priority-${(alert.priority || 'high').toLowerCase()}`}>
                {alert.priority || 'Critical'}
              </span>
              {/* Broadcast vs targeted badge */}
              {isBroadcast && (
                <span className="alert-badge" style={{ background: "#3b82f6", color: "white", display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem" }}>
                  <FaBroadcastTower size={10} /> Broadcast
                </span>
              )}
              {isTargetedToMe && (
                <span className="alert-badge" style={{ background: "#10b981", color: "white", display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem" }}>
                  <FaUserMd size={10} /> Assigned to You
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="alert-body">
          {/* Enhanced requester info for coordinators */}
          <div className="alert-requester-card">
            {alert.requesterName && (
              <span className="requester-info-item">
                <FaUser size={11} />
                <strong>{alert.requesterName}</strong>
              </span>
            )}
            {alert.requesterEmail && (
              <span className="requester-info-item">
                <FaEnvelope size={11} />
                <a href={`mailto:${alert.requesterEmail}`} title="Send email">{alert.requesterEmail}</a>
              </span>
            )}
            {alert.contactNumber && (
              <span className="requester-info-item">
                <FaPhone size={11} />
                <a href={`tel:${alert.contactNumber}`}>{alert.contactNumber}</a>
              </span>
            )}
            {alert.location && (
              <span className="requester-info-item">
                <FaMapMarkerAlt size={11} />
                {alert.location}
              </span>
            )}
            <span className="requester-info-item" style={{ color: "#94a3b8" }}>
              🕑 {new Date(alert.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>

          <div className="alert-actions">
            <select
              value={alert.status || 'Pending'}
              onChange={(e) => updateStatus(alert._id, e.target.value)}
              className="status-select"
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Ambulance Dispatched">Ambulance Dispatched</option>
              <option value="Arrived">Arrived</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="resource-page">
      <header className="resource-header">
        <div>
          <h1 className="resource-title">
            <span className="resource-title-icon-wrap">
              <FaExclamationTriangle className="resource-title-icon" />
            </span>
            Monitor Center
          </h1>
          <p className="resource-subtitle">
            {isProvider
              ? "Requests assigned to you and broadcast emergencies."
              : "Real-time emergency tracking and system notifications."}
          </p>
        </div>
        <div className="resource-controls">
          <div className="alert-tabs">
            <button
              className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveTab('emergency')}
            >
              Emergencies
              {emergencyAlerts.length > 0 && <span className="tab-badge danger">{emergencyAlerts.length}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
              {notificationAlerts.length > 0 && <span className="tab-badge info">{notificationAlerts.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {loading && <div style={{ padding: "1rem", textAlign: "center", width: "100%" }}>Loading...</div>}

      {!loading && activeTab === 'emergency' && (
        <div className="kanban-board">
          <div className="kanban-column">
            <h3 className="kanban-header title-pending">Pending ({pendingAlerts.length})</h3>
            <ul className="alerts-column-list">
              {pendingAlerts.length === 0 && <div className="empty-zone">No pending alerts</div>}
              {pendingAlerts.map(renderAlertCard)}
            </ul>
          </div>

          <div className="kanban-column">
            <h3 className="kanban-header title-active">Active Response ({activeAlerts.length})</h3>
            <ul className="alerts-column-list">
              {activeAlerts.length === 0 && <div className="empty-zone">No active responses</div>}
              {activeAlerts.map(renderAlertCard)}
            </ul>
          </div>

          <div className="kanban-column">
            <h3 className="kanban-header title-resolved">Resolved ({resolvedAlerts.length})</h3>
            <ul className="alerts-column-list">
              {resolvedAlerts.length === 0 && <div className="empty-zone">No resolved today</div>}
              {resolvedAlerts.map(renderAlertCard)}
            </ul>
          </div>
        </div>
      )}

      {!loading && activeTab === 'notifications' && (
        <ul className="alerts-grid">
          {notificationAlerts.length === 0 && (
            <div className="empty-state">No new notifications.</div>
          )}
          {notificationAlerts.map(renderAlertCard)}
        </ul>
      )}
    </div>
  );
}
