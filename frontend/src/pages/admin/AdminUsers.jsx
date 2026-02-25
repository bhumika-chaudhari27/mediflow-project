import { useEffect, useMemo, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import { adminApi } from "../../services/api";
import "../../styles/ResourceModule.css";
import "../../styles/AdminPanel.css";

const ROLE_LABELS = {
  Admin: "Admin",
  Provider: "Emergency Coordinator",
  User: "User",
};

function normalizeUsers(data) {
  const arr = Array.isArray(data) ? data : data?.users;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(Boolean)
    .map((u) => ({
      id: u.id ?? u._id ?? u.userId ?? u.email,
      name: u.name ?? u.fullName ?? "Unknown",
      email: u.email ?? "—",
      role: u.role ?? "User",
      active: typeof u.active === "boolean" ? u.active : true,
      createdAt: u.createdAt ?? u.created_on ?? null,
    }));
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    adminApi
      .getUsers()
      .then((data) => mounted && setUsers(normalizeUsers(data)))
      .catch((e) => mounted && setError(e?.message || "Failed to load users"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const roleOk = roleFilter === "all" ? true : (u.role || "User") === roleFilter;
      if (!roleOk) return false;
      if (!q) return true;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const counts = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "Admin").length;
    const providers = users.filter((u) => u.role === "Provider").length;
    const inactive = users.filter((u) => u.active === false).length;
    return { total, admins, providers, inactive };
  }, [users]);

  const onToggleActive = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const prev = users;
    const nextActive = !target.active;
    setSavingId(id);
    setError("");
    setUsers((cur) => cur.map((u) => (u.id === id ? { ...u, active: nextActive } : u)));
    try {
      await adminApi.setUserActive(id, nextActive);
    } catch (e) {
      setUsers(prev);
      setError(e?.message || "Failed to update user status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="admin-section" aria-label="User management">
      {error ? <div className="admin-callout error">{error}</div> : null}

      <div className="resource-summary">
        <span className="resource-summary-item">
          <strong>{counts.total}</strong> users
        </span>
        <span className="resource-summary-dot" aria-hidden />
        <span className="resource-summary-item">
          <strong>{counts.admins}</strong> admins
        </span>
        <span className="resource-summary-dot" aria-hidden />
        <span className="resource-summary-item">
          <strong>{counts.providers}</strong> emergency coordinators
        </span>
        <span className="resource-summary-dot" aria-hidden />
        <span className="resource-summary-item">
          <strong>{counts.inactive}</strong> inactive
        </span>
        <span className="resource-summary-meta">
          {loading ? "Loading…" : `Showing ${filtered.length}`}
        </span>
      </div>

      <div className="resource-toolbar">
        <span className="resource-toolbar-label">Filter</span>
        <div className="resource-filters">
          {["all", "Admin", "Provider", "User"].map((r) => (
            <button
              key={r}
              type="button"
              className={`filter-btn ${roleFilter === r ? "active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "all" ? "All" : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <input
          className="resource-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, role…"
          aria-label="Search users"
        />
      </div>

      <div className="resource-table-wrap">
        <table className="resource-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="admin-muted">
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-muted">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="role-label-static">
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${u.active ? "ok" : "critical"}`}>
                      {u.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className={`admin-btn ${u.active ? "danger" : "primary"}`}
                        onClick={() => onToggleActive(u.id)}
                        disabled={savingId === u.id}
                        aria-label={u.active ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                      >
                        <FaUserEdit />
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

