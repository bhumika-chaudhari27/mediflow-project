import { useEffect, useState } from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { adminApi } from "../../services/api";
import "../../styles/AdminPanel.css";

export default function AdminDonors() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        adminApi.getDonors()
            .then(data => mounted && setDonors(data))
            .catch(err => mounted && setError(err.message || "Failed to load donors"))
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    return (
        <section className="admin-section" aria-label="Donor management">
            <header className="admin-header">
                <h1>🩸 Registered Donors</h1>
                <p className="admin-muted">List of users who have volunteered to donate blood.</p>
            </header>

            {error && <div className="admin-callout error">{error}</div>}

            <div className="resource-table-wrap">
                <table className="resource-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Blood Group</th>
                            <th>Contact</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="admin-muted">Loading donors...</td></tr>
                        ) : donors.length === 0 ? (
                            <tr><td colSpan="5" className="admin-muted">No volunteer donors found.</td></tr>
                        ) : (
                            donors.map(d => (
                                <tr key={d._id || d.id}>
                                    <td>
                                        <strong>{d.name}</strong>
                                        <br />
                                        <span style={{ fontSize: "0.8rem", color: "#666" }}>{d.email}</span>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
                                            {d.bloodGroup || "Unknown"}
                                        </span>
                                    </td>
                                    <td>
                                        {d.emergencyContact?.phone || "N/A"}
                                    </td>
                                    <td>
                                        {/* Location is not yet in User model, placeholder */}
                                        {d.address || "—"}
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            {d.emergencyContact?.phone && (
                                                <a href={`tel:${d.emergencyContact.phone}`} className="admin-btn primary" title="Call">
                                                    <FaPhoneAlt />
                                                </a>
                                            )}
                                            <a href={`mailto:${d.email}`} className="admin-btn" title="Email">
                                                <FaEnvelope />
                                            </a>
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
