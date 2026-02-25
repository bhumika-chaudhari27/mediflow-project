import "../styles/StatCard.css";

export default function StatCard({ title, value, icon, type }) {
  return (
    <div className={`stat-card ${type || ""}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3>{title}</h3>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}
