import { useEffect, useState } from "react";
import { FaHeartbeat, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa";
import { donationApi } from "../../services/api";
import "../../styles/ResourceModule.css";

export default function AdminDonations() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [scheduleDate, setScheduleDate] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await donationApi.getAll();
            setRequests(data);
        } catch (err) {
            setError("Failed to load donation requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, date = null) => {
        try {
            await donationApi.update(id, { status, scheduledDate: date });
            setRequests(prev => prev.map(r => r._id === id ? { ...r, status, scheduledDate: date } : r));
            setSelectedRequest(null);
        } catch (err) {
            alert("Failed to update request: " + err.message);
        }
    };

    return (
        <section className="admin-section">
            <h2 className="section-title"><FaHeartbeat /> Donation Requests</h2>
            {error && <div className="admin-callout error">{error}</div>}

            <div className="resource-table-wrap">
                <table className="resource-table">
                    <thead>
                        <tr>
                            <th>Donor</th>
                            <th>Blood Group</th>
                            <th>Units</th>
                            <th>Contact</th>
                            <th>History</th>
                            <th>Status</th>
                            <th>Schedule</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="8">Loading...</td></tr> : requests.map(req => (
                            <tr key={req._id}>
                                <td>{(req.name && req.name !== "Unknown") ? req.name : (req.userId?.name || "Unknown")}</td>
                                <td><span className="badge">{req.bloodGroup}</span></td>
                                <td>{req.units}</td>
                                <td>{req.contactNumber}</td>
                                <td>{req.diseaseHistory.join(", ") || "None"}</td>
                                <td>
                                    <span className={`badge status-${req.status.toLowerCase()}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td>
                                    {req.scheduledDate ? new Date(req.scheduledDate).toLocaleString() : "-"}
                                </td>
                                <td>
                                    {req.status === "Pending" && (
                                        <div className="admin-actions">
                                            <button
                                                className="admin-btn primary"
                                                onClick={() => setSelectedRequest(req._id)}
                                            >
                                                <FaCalendarAlt /> Schedule
                                            </button>
                                        </div>
                                    )}
                                    {selectedRequest === req._id && (
                                        <div style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
                                            <input
                                                type="datetime-local"
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                                            />
                                            <button
                                                className="admin-btn primary"
                                                onClick={() => handleAction(req._id, "Approved", scheduleDate)}
                                                disabled={!scheduleDate}
                                            >
                                                <FaCheck /> Confirm
                                            </button>
                                            <button
                                                className="admin-btn danger"
                                                onClick={() => setSelectedRequest(null)}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                    {req.status === "Approved" && (
                                        <button
                                            className="admin-btn success"
                                            onClick={() => handleAction(req._id, "Completed")}
                                        >
                                            <FaCheck /> Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
