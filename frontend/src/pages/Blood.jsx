import { useState, useEffect } from "react";
import { FaTint } from "react-icons/fa";
import { bloodBankApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/ResourceModule.css";

const FILTER_LABELS = { all: "All", Available: "Available", Critical: "Critical", Empty: "Empty" };

export default function Blood() {
  const { user } = useAuth();
  const [bloodBags, setBloodBags] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bloodBankApi.getAll()
      .then(data => {
        setBloodBags(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch blood bags", err);
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === "all"
      ? bloodBags
      : bloodBags.filter((b) => b.status === filter);

  const needAttention = bloodBags.filter(
    (b) => b.status === "Critical" || b.status === "Empty"
  ).length;

  return (
    <div className="resource-page">
      <header className="resource-header">
        <h1 className="resource-title">
          <span className="resource-title-icon-wrap">
            <FaTint className="resource-title-icon" />
          </span>
          Blood Availability
        </h1>
        <p className="resource-subtitle">
          Real-time blood bank inventory by type. Monitor supply levels and prioritize urgent requirements across the medical network.
        </p>
      </header>

      <div className="resource-summary">
        <span className="resource-summary-item">
          <strong>{bloodBags.length}</strong> blood types
        </span>
        <span className="resource-summary-dot" aria-hidden />
        <span className="resource-summary-item">
          <strong>{needAttention}</strong> need attention
        </span>
        <span className="resource-summary-meta">Live Data</span>
      </div>

      <div className="resource-toolbar">
        {(!user || user.role !== "User") && (
          <>
            <span className="resource-toolbar-label">Filter by status</span>
            <div className="resource-filters">
              {Object.keys(FILTER_LABELS).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="resource-grid">
        {loading ? (
          <div style={{ padding: "2rem", width: "100%", textAlign: "center", color: "#666" }}>Loading blood bank data...</div>
        ) : (
          filtered.map((row) => (
            <div
              key={row._id || row.bloodGroup}
              className={`resource-card status-${row.status.toLowerCase()}`}
            >
              <div className="resource-card-header">
                <div className="resource-card-type">{row.bloodGroup}</div>
                <span className="resource-card-badge">{row.status}</span>
              </div>
              <div className="resource-card-value">{row.quantity} units</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
