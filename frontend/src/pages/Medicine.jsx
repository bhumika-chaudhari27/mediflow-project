import { useState, useEffect } from "react";
import { FaPills } from "react-icons/fa";
import { inventoryApi } from "../services/api";
import "../styles/ResourceModule.css";

export default function Medicine() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.getByCategory('Medicine')
      .then(data => {
        setMedicines(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch medicines", err);
        setLoading(false);
      });
  }, []);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const needAttention = medicines.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock").length;

  return (
    <div className="resource-page">
      <header className="resource-header">
        <h1 className="resource-title">
          <span className="resource-title-icon-wrap">
            <FaPills className="resource-title-icon" />
          </span>
          Medicine Availability
        </h1>
        <p className="resource-subtitle">
          Comprehensive pharmaceutical inventory. Tracks real-time stock levels of critical medicines and healthcare supplies.
        </p>
      </header>

      <div className="resource-summary">
        <span className="resource-summary-item">
          <strong>{medicines.length}</strong> items
        </span>
        <span className="resource-summary-dot" aria-hidden />
        <span className="resource-summary-item">
          <strong>{needAttention}</strong> need attention
        </span>
        <span className="resource-summary-meta">Live Data</span>
      </div>

      <div className="resource-toolbar">
        <input
          type="search"
          placeholder="Search medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="resource-search"
        />
      </div>

      <div className="resource-table-wrap">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>Loading medicines...</div>
        ) : (
          <table className="resource-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row._id || row.name}>
                  <td>{row.name}</td>
                  <td>{row.quantity} {row.unit}</td>
                  <td>
                    <span className={`badge status-${row.status.toLowerCase().replace(/ /g, '-')}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
