import { useState, useEffect } from "react";
import { FaHospital, FaPaperPlane, FaBroadcastTower, FaUserMd } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardApi, coordinatorApi } from "../services/api";
import SuccessModal from "../components/SuccessModal";
import "../styles/Login.css";
import "../styles/RequestHelp.css";

export default function RequestHelp() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        requesterName: user?.name || "",
        contactNumber: user?.phone || "",
        location: "",
        category: "Ambulance",
        message: "",
        priority: "Critical"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // Coordinator targeting state
    const [coordinators, setCoordinators] = useState([]);
    const [targetMode, setTargetMode] = useState("all"); // "all" | "specific"
    const [selectedCoordinatorId, setSelectedCoordinatorId] = useState("");

    useEffect(() => {
        coordinatorApi.getAll()
            .then(data => setCoordinators(Array.isArray(data) ? data : []))
            .catch(() => setCoordinators([]));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (targetMode === "specific" && !selectedCoordinatorId) {
            setError("Please select an Emergency Coordinator.");
            return;
        }
        setIsSubmitting(true);
        setError("");

        try {
            const alertData = {
                ...formData,
                type: "Critical",
                targetAll: targetMode === "all",
                targetCoordinatorId: targetMode === "specific" ? selectedCoordinatorId : null,
                requesterEmail: user?.email || "",
            };

            if (user) {
                alertData.userId = user.id || user._id;
            }

            await dashboardApi.createAlert(alertData);
            setShowSuccess(true);
        } catch (err) {
            setError(err.message || "Failed to send request. Please call 911/112.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: "520px" }}>
                <div className="auth-header">
                    <FaHospital className="auth-icon mf-animate-float" style={{ fontSize: "48px", color: "var(--mf-primary-600)", marginBottom: "1rem" }} />
                    <h1 className="auth-title">Emergency Request</h1>
                    <p className="auth-subtitle">Request immediate medical assistance</p>
                </div>

                {error && <div className="admin-callout error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="label-visible">Your Name</label>
                        <input
                            className="auth-input"
                            type="text"
                            name="requesterName"
                            value={formData.requesterName}
                            onChange={handleChange}
                            required
                            placeholder="Who needs help?"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-visible">Contact Number</label>
                        <input
                            className="auth-input"
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            required
                            placeholder="Mobile number for status updates"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-visible">Current Location</label>
                        <input
                            className="auth-input"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="Address / Landmark"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label-visible">Type of Emergency</label>
                        <select className="auth-input" name="category" value={formData.category} onChange={handleChange}>
                            <option value="Ambulance">Ambulance</option>
                            <option value="Blood">Blood Requirement</option>
                            <option value="Accident">Accident / Trauma</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label-visible">Details</label>
                        <textarea
                            className="auth-input"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder="Briefly describe the situation..."
                            rows="3"
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    {/* ── Coordinator Targeting ── */}
                    <div className="coordinator-target-section">
                        <label className="label-visible" style={{ marginBottom: "10px", display: "block" }}>
                            Send Request To
                        </label>
                        <div className="target-mode-toggle">
                            <button
                                type="button"
                                className={`target-mode-btn ${targetMode === "all" ? "active" : ""}`}
                                onClick={() => setTargetMode("all")}
                            >
                                <FaBroadcastTower /> Request to All
                            </button>
                            <button
                                type="button"
                                className={`target-mode-btn ${targetMode === "specific" ? "active" : ""}`}
                                onClick={() => setTargetMode("specific")}
                            >
                                <FaUserMd /> Select Coordinator
                            </button>
                        </div>

                        {targetMode === "all" && (
                            <div className="target-info-box">
                                <FaBroadcastTower style={{ color: "#3b82f6" }} />
                                <span>Your request will be visible to <strong>all Emergency Coordinators</strong>.</span>
                            </div>
                        )}

                        {targetMode === "specific" && (
                            <div>
                                <select
                                    className="auth-input"
                                    style={{ marginTop: "10px" }}
                                    value={selectedCoordinatorId}
                                    onChange={(e) => setSelectedCoordinatorId(e.target.value)}
                                    required={targetMode === "specific"}
                                >
                                    <option value="">— Select a Coordinator —</option>
                                    {coordinators.length === 0 && (
                                        <option disabled>No coordinators available</option>
                                    )}
                                    {coordinators.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.name} — {c.email}
                                        </option>
                                    ))}
                                </select>
                                {selectedCoordinatorId && (
                                    <div className="target-info-box success">
                                        <FaUserMd style={{ color: "#10b981" }} />
                                        <span>Request will be sent to <strong>{coordinators.find(c => c._id === selectedCoordinatorId)?.name}</strong>.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="auth-btn" style={{ background: "#e74c3c", marginTop: "1.2rem" }} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Request Help Now"} <FaPaperPlane />
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: "16px", textAlign: "center" }}>
                    <Link to="/login" className="auth-link">Cancel &amp; Go Back</Link>
                </div>
            </div>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => navigate("/")}
                title="Help Request Sent"
                message={
                    targetMode === "all"
                        ? "Your request has been sent to all Emergency Coordinators. Help is on the way!"
                        : `Your request has been sent to ${coordinators.find(c => c._id === selectedCoordinatorId)?.name || "the coordinator"}.`
                }
            />
        </div>
    );
}
