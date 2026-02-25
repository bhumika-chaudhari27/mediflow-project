import { useState, useEffect } from "react";
import {
    FaTint,
    FaHospital,
    FaExclamationTriangle,
    FaClipboardList,
    FaClock,
    FaCheckCircle,
    FaHandHoldingHeart,
    FaAmbulance,
    FaTrash
} from "react-icons/fa";
import { dashboardApi, userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/MyRequests.css";

const categoryIcons = {
    "Blood": FaTint,
    "Donation": FaHandHoldingHeart,
    "Ambulance": FaAmbulance,
    "Accident": FaExclamationTriangle,
    "Emergency": FaHospital,
    "default": FaClipboardList
};

export default function MyRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, request: null });

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const results = await userApi.getMyRequests();
                if (results) {
                    setRequests(results);
                }
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRequests();
        }
    }, [user]);

    const handleDeleteClick = (req) => {
        setConfirmModal({ isOpen: true, request: req });
    };

    const handleConfirmDelete = async () => {
        const req = confirmModal.request;
        if (!req) return;

        try {
            if (req.type === 'donation') {
                await userApi.deleteDonation(req._id);
            } else {
                await dashboardApi.deleteAlert(req._id);
            }
            setRequests(prev => prev.filter(r => r._id !== req._id));
        } catch (error) {
            console.error("Failed to delete request", error);
            alert("Failed to delete request");
        } finally {
            setConfirmModal({ isOpen: false, request: null });
        }
    };

    const getIcon = (category) => {
        const Icon = categoryIcons[category] || categoryIcons["default"];
        return <Icon />;
    };

    if (loading) return <div className="requests-container"><p>Loading your requests...</p></div>;

    return (
        <div className="requests-container">
            <header className="requests-header">
                <h1>My Help Requests</h1>
                <p>Monitor and track the status of your active and past emergency calls.</p>
            </header>

            <div className="requests-grid">
                {requests.length > 0 ? (
                    requests.map((req) => (
                        <div key={req._id} className={`request-card priority-${req.priority ? req.priority.toLowerCase() : 'medium'}`}>
                            <div className="request-card-header">
                                <div className="request-icon-box">
                                    {getIcon(req.category)}
                                </div>
                                <div className="request-type-info">
                                    <div className="request-title-row">
                                        <h3>{req.category} Request</h3>
                                        <button
                                            className="request-delete-btn"
                                            onClick={() => handleDeleteClick(req)}
                                            title="Delete Request"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <span className={`request-status-badge status-${req.status ? req.status.toLowerCase().replace(/\s+/g, '-') : 'pending'}`}>
                                        {req.status || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="request-card-body">
                                <p className="request-message">{req.message}</p>
                            </div>

                            <div className="request-card-footer">
                                <div className="request-time">
                                    <FaClock />
                                    <span>{new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="requests-empty">
                        <div className="empty-icon"><FaCheckCircle /></div>
                        <h2>No Active Requests</h2>
                        <p>You haven't made any requests yet. If you need help, head to the Request Help section.</p>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, request: null })}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
