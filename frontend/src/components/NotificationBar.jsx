import { useState, useEffect } from "react";
import { FaBell, FaTimes, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import { dashboardApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/NotificationBar.css";

export default function NotificationBar() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem("mediflow_dismissed_alerts");
    return saved ? JSON.parse(saved) : [];
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await dashboardApi.getAlerts();
        if (Array.isArray(data)) {
          let visibleAlerts = data;

          // Role-based filtering
          if (user && !["Admin", "Provider"].includes(user.role)) {
            // Users only see their OWN requests that have a status UPDATE (not Pending)
            // Pending = "we received it" — no notification needed yet
            visibleAlerts = data.filter(alert =>
              (alert.userId === (user.id || user._id) || alert.requesterName === user.name) &&
              alert.status && alert.status !== 'Pending'
            );
          } else if (user) {
            visibleAlerts = data.filter(alert => !alert.isResolved);
          }

          // Filter out dismissed alerts
          const activeAlerts = visibleAlerts.filter(alert => !dismissedIds.includes(alert._id));

          // Map backend alerts to notification format
          const formatted = activeAlerts.map(alert => {
            let text = alert.message || alert.title;
            if (user && !["Admin", "Provider"].includes(user.role) && alert.status && alert.status !== 'Pending') {
              text = `${alert.status.toUpperCase()}: ${text}`;
            }

            return {
              id: alert._id,
              type: getNotificationType(alert.priority),
              text: text,
              time: formatTime(alert.createdAt),
              status: alert.status
            };
          });
          setItems(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, dismissedIds]);

  const dismiss = (id) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("mediflow_dismissed_alerts", JSON.stringify(newDismissed));
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    const allIds = items.map(n => n.id);
    const newDismissed = [...new Set([...dismissedIds, ...allIds])];
    setDismissedIds(newDismissed);
    localStorage.setItem("mediflow_dismissed_alerts", JSON.stringify(newDismissed));
    setItems([]);
  };

  const unreadCount = items.length;

  return (
    <div className="notification-bar">
      <button
        type="button"
        className={`notification-trigger ${open ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications ${unreadCount ? `(${unreadCount})` : ""}`}
      >
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {open && (
        <>
          <div className="notification-backdrop" onClick={() => setOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <div className="header-left">
                <h3>{user && ["Admin", "Provider"].includes(user.role) ? "Notifications" : "My Requests"}</h3>
                {items.length > 0 && (
                  <button type="button" className="clear-all-btn" onClick={clearAll}>
                    Clear All
                  </button>
                )}
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="close-btn">
                <FaTimes />
              </button>
            </div>
            <ul className="notification-list">
              {loading && <li className="notification-empty">Loading...</li>}
              {!loading && items.length === 0 ? (
                <li className="notification-empty">
                  <div className="empty-icon"><FaBell /></div>
                  <p>No new notifications</p>
                </li>
              ) : (
                items.map((n) => {
                  let Icon = FaInfoCircle;
                  if (n.type === 'alert') Icon = FaExclamationCircle;
                  if (n.type === 'warning') Icon = FaExclamationTriangle;

                  return (
                    <li key={n.id} className={`notification-item notification-${n.type}`}>
                      <div className="notification-icon-col">
                        <Icon />
                      </div>
                      <div className="notification-content-col">
                        <p className="notification-text">{n.text}</p>
                        <div className="notification-meta">
                          <span>{n.time}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="dismiss-btn">Dismiss</button>
                        </div>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function getNotificationType(priority) {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'alert';
    case 'high': return 'warning';
    default: return 'info';
  }
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr ago`;
  return date.toLocaleDateString();
}
