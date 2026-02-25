import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTint, FaPhone, FaAmbulance, FaSave, FaHeartbeat } from "react-icons/fa";
import { userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        bloodGroup: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        isDonor: false
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const userId = user.id || user._id;
            try {
                const profile = await userApi.getProfile(userId);
                if (profile) {
                    setFormData({
                        name: user?.name || "",
                        phone: profile.phone || user?.phone || "",
                        bloodGroup: profile.bloodGroup || "",
                        emergencyContactName: profile.emergencyContact?.name || "",
                        emergencyContactPhone: profile.emergencyContact?.phone || "",
                        emergencyContactRelation: profile.emergencyContact?.relation || "",
                        isDonor: profile.isDonor || false
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = user.id || user._id;
        setSaving(true);
        setError("");
        try {
            await userApi.updateProfile(userId, {
                name: formData.name,
                phone: formData.phone,
                bloodGroup: formData.bloodGroup,
                emergencyContact: {
                    name: formData.emergencyContactName,
                    phone: formData.emergencyContactPhone,
                    relation: formData.emergencyContactRelation
                },
                isDonor: formData.isDonor
            });
            // Persist updated fields so dashboard health card reflects instantly
            const storedUser = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
            localStorage.setItem("mediflow_user", JSON.stringify({
                ...storedUser,
                name: formData.name,
                bloodGroup: formData.bloodGroup,
                phone: formData.phone
            }));
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to save profile. Please try again.");
            setSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                {/* Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {(user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="profile-title">Medical Profile</h1>
                        <p className="profile-subtitle">Update your health details — used when requesting help</p>
                    </div>
                </div>

                {error && (
                    <div className="profile-error">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Personal Info */}
                    <div className="profile-section">
                        <h2 className="profile-section-title">
                            <FaUser className="profile-section-icon" /> Personal Info
                        </h2>
                        <div className="profile-fields">
                            <div className="profile-field">
                                <label>Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Phone Number</label>
                                <div className="profile-input-icon">
                                    <FaPhone className="input-icon" />
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="profile-section">
                        <h2 className="profile-section-title">
                            <FaTint className="profile-section-icon" style={{ color: "#ef4444" }} /> Medical Info
                        </h2>
                        <div className="profile-fields">
                            <div className="profile-field">
                                <label>Blood Group</label>
                                <div className="profile-input-icon">
                                    <FaTint className="input-icon" style={{ color: "#ef4444" }} />
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                                        <option value="">Select Blood Group</option>
                                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Donor toggle */}
                        <label className="donor-toggle">
                            <input
                                type="checkbox"
                                checked={formData.isDonor}
                                onChange={(e) => setFormData({ ...formData, isDonor: e.target.checked })}
                            />
                            <div className="donor-toggle-box">
                                <FaHeartbeat style={{ color: "#ef4444" }} />
                                <span>I'm available to <strong>donate blood</strong> 🩸</span>
                            </div>
                        </label>
                    </div>

                    {/* Emergency Contact */}
                    <div className="profile-section">
                        <h2 className="profile-section-title">
                            <FaAmbulance className="profile-section-icon" style={{ color: "#f59e0b" }} /> Emergency Contact
                        </h2>
                        <div className="profile-fields">
                            <div className="profile-field">
                                <label>Contact Name</label>
                                <input
                                    name="emergencyContactName"
                                    type="text"
                                    value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Contact Phone</label>
                                <input
                                    name="emergencyContactPhone"
                                    type="tel"
                                    value={formData.emergencyContactPhone}
                                    onChange={handleChange}
                                    placeholder="e.g. +91 9876543210"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Relation</label>
                                <input
                                    name="emergencyContactRelation"
                                    type="text"
                                    value={formData.emergencyContactRelation}
                                    onChange={handleChange}
                                    placeholder="e.g. Father, Spouse"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile-actions">
                        <button type="button" className="profile-btn-cancel" onClick={() => navigate("/dashboard")}>
                            Cancel
                        </button>
                        <button type="submit" className="profile-btn-save" disabled={saving}>
                            <FaSave /> {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
