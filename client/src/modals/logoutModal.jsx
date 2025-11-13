import React, { useState } from "react";
import "../CSS/logoutModal.css";

function LogoutModal({ isOpen, onClose, onConfirm }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirm();
    }, 300); // Match animation duration
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`logout-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to logout?</p>
        <div className="logout-modal-buttons">
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={handleConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
