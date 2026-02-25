import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/api";
import "../../styles/ResourceModule.css";
import "../../styles/AdminPanel.css";

function normalizeLogs(data) {
  const arr = Array.isArray(data) ? data : data?.logs;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(Boolean)
    .map((l, idx) => ({
      id: l.id ?? l._id ?? `${idx}`,
      time: l.time ?? l.timestamp ?? l.createdAt ?? null,
      actor: l.actor ?? l.user ?? "System",
      action: l.action ?? l.event ?? "Event",
      detail: l.detail ?? l.message ?? "",
      level: (l.level ?? "info").toLowerCase(),
    }));
}

function fmt(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    adminApi
      .getLogs()
      .then((data) => mounted && setLogs(normalizeLogs(data)))
      .catch((e) => mounted && setError(e?.message || "Failed to load logs"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      return (
        (l.actor || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q) ||
        (l.detail || "").toLowerCase().includes(q) ||
        (l.level || "").toLowerCase().includes(q)
      );
    });
  }, [logs, query]);

  return (
    <section className="admin-section" aria-label="Admin logs">
      {error ? <div className="admin-callout error">{error}</div> : null}

      <div className="resource-toolbar">
        <span className="resource-toolbar-label">Search logs</span>
        <input
          className="resource-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actor, action, detail…"
          aria-label="Search logs"
        />
        <span className="admin-muted">{loading ? "Loading…" : `Showing ${filtered.length}`}</span>
      </div>

      <div className="resource-table-wrap">
        <table className="resource-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Level</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="admin-muted">
                  Loading logs…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-muted">
                  No logs found.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id}>
                  <td>{fmt(l.time)}</td>
                  <td>{l.actor}</td>
                  <td>{l.action}</td>
                  <td>
                    <span className={`badge status-${l.level === "error" ? "critical" : l.level === "warn" ? "low" : "ok"}`}>
                      {l.level}
                    </span>
                  </td>
                  <td>{l.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

