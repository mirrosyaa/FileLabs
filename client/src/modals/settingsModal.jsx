import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/settingsModal.css";
import defaultPhoto from "../media/defaultProfile.jpg";

function SettingsModal({ isOpen, onClose }) {
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch user profile data when modal opens
      const fetchUserData = async () => {
        try {
          // Get user profile info
          const profileResponse = await axios.get(
            "http://localhost:3001/users/profile"
          );
          setUsername(profileResponse.data.user.username);

          // Get user profile photo
          const photoResponse = await axios.get(
            "http://localhost:3001/users/my-profile-photo",
            { responseType: "blob" }
          );
          const photoUrl = URL.createObjectURL(photoResponse.data);
          setProfilePhoto(photoUrl);
        } catch (err) {
          console.log("Error loading profile data:", err);
          setProfilePhoto(defaultPhoto);
        }
      };

      fetchUserData();
    }
  }, [isOpen]);

  // Handle photo upload
  const handlePhotoClick = () => {
    document.getElementById("photo-upload-input").click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large! Max size is 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axios.post("http://localhost:3001/users/profile-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update the photo preview
      const photoUrl = URL.createObjectURL(file);
      setProfilePhoto(photoUrl);

      // Dispatch custom event to notify navbar to update photo
      window.dispatchEvent(new CustomEvent("profilePhotoUpdated"));

      alert("Photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    }
  };

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
          {/* Profile Photo and Username Display */}
          <div className="profile-display">
            <div className="photo-upload-container" onClick={handlePhotoClick}>
              <img
                src={profilePhoto}
                alt="profile"
                className="modal-profile-photo"
              />
              <div className="camera-overlay">
                <svg
                  className="camera-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  width="40px"
                  height="40px"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                </svg>
              </div>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </div>
            <h3 className="modal-username">{username || "Loading..."}</h3>
          </div>

          {/* Change Username Section */}
          <div className="setting-section">
            <h3>Change Username</h3>
            <div className="setting-item">
              <label>New Username</label>
              <input type="text" placeholder="Enter new username" />
            </div>
          </div>

          {/* Change Email Section */}
          <div className="setting-section">
            <h3>Change Email</h3>
            <div className="setting-item">
              <label>New Email</label>
              <input type="email" placeholder="Enter new email" />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="setting-section">
            <h3>Change Password</h3>
            <div className="setting-item">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" />
            </div>
            <div className="setting-item">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="setting-item">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
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
