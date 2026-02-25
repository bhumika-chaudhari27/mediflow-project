import { useState, useEffect } from "react";
import { FaBoxes, FaPlus, FaTint } from "react-icons/fa";
import { inventoryApi, bloodBankApi } from "../../services/api";
import "../../styles/ResourceModule.css";
import "../../styles/AdminPanel.css";

export default function AdminInventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "Medicine",
        quantity: "",
        unit: "",
        expiryDate: "",
        location: "",
        bloodGroup: "", // For Blood
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const [invData, bloodData] = await Promise.all([
                inventoryApi.getAll().catch(() => []),
                bloodBankApi.getAll().catch(() => [])
            ]);

            // Normalize blood data to match inventory structure for display
            const normalizedBlood = (bloodData || []).map(b => ({
                _id: b._id,
                name: `${b.bloodGroup} Blood`,
                category: "Blood",
                quantity: b.quantity, // Match model field
                unit: "bags",
                location: b.location || "Blood Bank",
                status: b.status,
                expiryDate: b.expiryDate
            }));

            setItems([...(invData || []), ...normalizedBlood]);
        } catch (err) {
            setError("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            if (formData.category === "Blood") {
                await bloodBankApi.create({
                    bloodGroup: formData.bloodGroup,
                    quantity: Number(formData.quantity), // Match model field 'quantity'
                    status: "Available", // Default
                    location: formData.location,
                    expiryDate: formData.expiryDate
                });
            } else {
                await inventoryApi.create({
                    ...formData,
                    quantity: Number(formData.quantity)
                });
            }

            // Reset form and reload
            setFormData({
                name: "",
                category: "Medicine",
                quantity: "",
                unit: "",
                expiryDate: "",
                location: "",
                bloodGroup: ""
            });
            loadItems();
            alert("Item added successfully!");
        } catch (err) {
            setError(err.message || "Failed to add item");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="admin-section" aria-label="Inventory Management">
            <div className="resource-header">
                <h2 className="resource-title">
                    <FaBoxes className="resource-title-icon" /> Inventory Manager
                </h2>
            </div>

            {error && <div className="admin-callout error">{error}</div>}

            {/* Add Item Form */}
            <div className="admin-card">
                <h3>Add New Item</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="Medicine">Medicine</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Blood">Blood</option>
                            </select>
                        </div>

                        {formData.category === "Blood" ? (
                            <div className="form-group">
                                <label>Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Paracetamol"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>{formData.category === "Blood" ? "Units (Bags)" : "Quantity"}</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        {formData.category !== "Blood" && (
                            <div className="form-group">
                                <label>Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. tablets"
                                />
                            </div>
                        )}

                        {formData.category !== "Equipment" && (
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    required={formData.category === "Blood"}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Shelf A or Fridge 1"
                            />
                        </div>
                    </div>

                    <button type="submit" className="admin-btn primary" disabled={isSubmitting}>
                        <FaPlus /> {isSubmitting ? "Adding..." : "Add to Inventory"}
                    </button>
                </form>
            </div>

            {/* Inventory List */}
            <div className="resource-table-wrap" style={{ marginTop: "2rem" }}>
                <h3>Current Inventory ({items.length})</h3>
                <table className="resource-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Location</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="5">No items found.</td></tr>
                        ) : items.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    {item.category === 'Blood' && <FaTint className="text-danger" style={{ marginRight: '8px' }} />}
                                    {item.name}
                                </td>
                                <td>{item.category}</td>
                                <td>{item.quantity} {item.unit}</td>
                                <td>{item.location || "-"}</td>
                                <td>
                                    <span className={`badge status-${(item.status || 'unknown').toLowerCase().replace(/ /g, '-')}`}>
                                        {item.status || 'Unknown'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
