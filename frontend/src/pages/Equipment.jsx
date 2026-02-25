import { useState, useEffect } from "react";
import { FaCogs } from "react-icons/fa";
import { inventoryApi } from "../services/api";
import "../styles/ResourceModule.css";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.getByCategory('Equipment')
      .then(data => {
        setEquipment(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch equipment", err);
        setLoading(false);
      });
  }, []);

  const needAttention = equipment.filter((e) => e.status === "Low Stock" || e.status === "Critical" || e.status === "Out of Stock").length;

  return (
    <div className="resource-page">
      <header className="resource-header">
        <h1 className="resource-title">
          <span className="resource-title-icon-wrap">
            <FaCogs className="resource-title-icon" />
          </span>
          Equipment Status
        </h1>
        <p className="resource-subtitle">
          Live status of medical assets. Monitoring availability and operational readiness across all facility departments.
        </p>
      </header>

      <div className="resource-summary">
        <span className="resource-summary-item">
          <strong>{equipment.length}</strong> equipment types
        </span>
        <span className="resource-summary-dot" aria-hidden />
        <span className="resource-summary-item">
          <strong>{needAttention}</strong> need attention
        </span>
        <span className="resource-summary-meta">Live Data</span>
      </div>

      <div className="resource-grid">
        {loading ? (
          <div style={{ padding: "2rem", width: "100%", textAlign: "center", color: "#666" }}>Loading equipment...</div>
        ) : (
          equipment.map((row) => (
            <div key={row._id || row.name} className={`resource-card status-${row.status.toLowerCase().replace(/ /g, '-')}`}>
              <div className="resource-card-header">
                <div className="resource-card-type">{row.name}</div>
                <span className="resource-card-badge">{row.status}</span>
              </div>
              <div className="resource-card-value">
                {row.quantity} units {row.location ? `(${row.location})` : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
