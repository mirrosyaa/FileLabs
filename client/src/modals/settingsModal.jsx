import React from "react";
import "../CSS/settingsModal.css";

function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Close modal when clicking on overlay (background)
  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-section">
            <h3>Profile Settings</h3>
            <div className="setting-item">
              <label>Username</label>
              <input type="text" placeholder="Enter username" />
            </div>
            <div className="setting-item">
              <label>Email</label>
              <input type="email" placeholder="Enter email" />
            </div>
          </div>

          <div className="setting-section">
            <h3>Account Settings</h3>
            <div className="setting-item">
              <label>Change Password</label>
              <input type="password" placeholder="New password" />
            </div>
          </div>

          <div className="setting-section">
            <h3>Profile Photo</h3>
            <div className="setting-item">
              <label>Upload New Photo</label>
              <input type="file" accept="image/*" />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
