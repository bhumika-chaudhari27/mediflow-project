import React, { useEffect } from "react";
import "../styles/SuccessModal.css";

const SuccessModal = ({ isOpen, onClose, title = "Request Sent Successfully", message = "Your emergency request has been received. Help is on the way." }) => {
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
                className="success-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="success-icon-container">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="success-icon"
                    >
                        <polyline points="20 6 9 17 4 12" className="checkmark-path"></polyline>
                    </svg>
                </div>

                <h2 id="modal-title" className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>

                <button className="modal-button" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
