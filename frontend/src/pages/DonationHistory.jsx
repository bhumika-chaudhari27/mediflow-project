import { useState, useEffect } from "react";
import { userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { FaTint } from "react-icons/fa";
import "../styles/ResourceModule.css";

export default function DonationHistory() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newDonation, setNewDonation] = useState({ date: "", hospital: "", units: 1 });

    useEffect(() => {
        const fetchDonations = async () => {
            if (!user) return;
            const userId = user.id || user._id;
            try {
                const data = await userApi.getDonations(userId);
                setDonations(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchDonations();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = user.id || user._id;
        try {
            // In a real app, this would be validated by a hospital admin
            const updated = await userApi.addDonation(userId, newDonation);
            setDonations(updated); // Backend returns updated list
            setShowForm(false);
            setNewDonation({ date: "", hospital: "", units: 1 });
        } catch (error) {
            alert("Failed to add donation");
        }
    };

    return (
        <div className="resource-page">
            <header className="page-header">
                <h1>Blood Donation History</h1>
                <p>Thank you for saving lives! Here is your donation record.</p>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Log Donation"}
                </button>
            </header>

            {showForm && (
                <div className="admin-card" style={{ marginBottom: "2rem" }}>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" required value={newDonation.date} onChange={e => setNewDonation({ ...newDonation, date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Hospital / Camp</label>
                            <input type="text" required placeholder="City Hospital" value={newDonation.hospital} onChange={e => setNewDonation({ ...newDonation, hospital: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Units</label>
                            <input type="number" min="1" required value={newDonation.units} onChange={e => setNewDonation({ ...newDonation, units: e.target.value })} />
                        </div>
                        <button type="submit" className="save-btn">Save Record</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="resource-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Units</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.length > 0 ? (
                            donations.map((d, i) => (
                                <tr key={i}>
                                    <td>{new Date(d.date).toLocaleDateString()}</td>
                                    <td>{d.hospital}</td>
                                    <td>{d.units}</td>
                                    <td>Whole Blood</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>No donations recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
