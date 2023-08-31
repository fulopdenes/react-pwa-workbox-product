import React from 'react';

function ConfirmationModal({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <p>{message}</p>
                <div className="modal-buttons">
                    <button className="modal-button confirm" onClick={onConfirm}>Yes</button>
                    <button className="modal-button cancel" onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;