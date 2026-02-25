import React, { useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import "../styles/ConfirmationModal.css";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Request?",
    message = "Are you sure you want to delete this request? This action cannot be undone."
}) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
            <div
                className="confirmation-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                <div className="confirm-icon-container">
                    <FaExclamationTriangle className="confirm-icon mf-animate-pulse" />
                </div>

                <h2 id="confirm-modal-title" className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    <button className="modal-btn btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="modal-btn btn-confirm" onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
