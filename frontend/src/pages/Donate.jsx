import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaArrowLeft } from "react-icons/fa";
import { donationApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SuccessModal from "../components/SuccessModal";
import "../styles/Login.css";

export default function Donate() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        bloodGroup: user?.bloodGroup || "",
        units: 1,
        contactNumber: user?.phone || "",
        lastDonationDate: "",
        diseaseHistory: []
    });

    const diseaseOptions = ["Diabetes", "Hypertension", "HIV/AIDS", "Hepatitis", "None"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (disease) => {
        setFormData(prev => {
            const current = prev.diseaseHistory;
            if (current.includes(disease)) {
                return { ...prev, diseaseHistory: current.filter(d => d !== disease) };
            } else {
                if (disease === "None") return { ...prev, diseaseHistory: ["None"] };
                return { ...prev, diseaseHistory: [...current.filter(d => d !== "None"), disease] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await donationApi.create({
                ...formData,
                name: user?.name || "Anonymous"
            });
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 3000);
        } catch (err) {
            setError(err.message || "Failed to submit donation request.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <FaArrowLeft /> Back
                </button>
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <FaHeartbeat className="mf-animate-pulse" size={40} color="#e74c3c" />
                </div>
                <h2 className="auth-title">Become a Donor</h2>
                <p className="auth-subtitle">Fill out the form to request a donation appointment.</p>

                {error && <div className="auth-message auth-message-error">{error}</div>}

                <div className="field-group">
                    <label className="label-visible">Blood Group</label>
                    <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    >
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                        ))}
                    </select>
                </div>

                <div className="field-group">
                    <label className="label-visible">Units to Donate</label>
                    <input
                        type="number"
                        name="units"
                        min="1"
                        max="5"
                        value={formData.units}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                </div>

                <div className="field-group">
                    <label className="label-visible">Contact Number</label>
                    <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="auth-input"
                        placeholder="e.g., +1 234 567 890"
                        required
                    />
                </div>

                <div className="field-group">
                    <label className="label-visible">Last Donation Date (Optional)</label>
                    <input
                        type="date"
                        name="lastDonationDate"
                        value={formData.lastDonationDate}
                        onChange={handleChange}
                        className="auth-input"
                    />
                </div>

                <div className="field-group">
                    <label className="label-visible">Medical History</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px" }}>
                        {diseaseOptions.map(d => (
                            <label key={d} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontSize: "0.9rem" }}>
                                <input
                                    type="checkbox"
                                    checked={formData.diseaseHistory.includes(d)}
                                    onChange={() => handleCheckbox(d)}
                                />
                                {d}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                </button>
            </form>

            <SuccessModal
                isOpen={success}
                onClose={() => navigate("/dashboard")}
                title="Donation Request Sent"
                message="Thank you! Your donation request has been submitted. A provider will review it shortly."
            />
        </div>
    );
}
