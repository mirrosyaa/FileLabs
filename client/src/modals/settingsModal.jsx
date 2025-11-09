import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/settingsModal.css";
import defaultPhoto from "../media/defaultProfile.jpg";

function SettingsModal({ isOpen, onClose }) {
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Account details form state
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState(false);

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  useEffect(() => {
    if (isOpen) {
      // Fetch user profile data when modal opens
      const fetchUserData = async () => {
        try {
          // Get user profile info
          const profileResponse = await axios.get(
            "http://localhost:3001/users/profile"
          );
          const user = profileResponse.data.user;
          setUsername(user.username);
          setEmail(user.user_email);
          setNewUsername(user.username); // Set current values as defaults
          setNewEmail(user.user_email);

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

      // Clear form states when modal opens
      setAccountError("");
      setAccountSuccess(false);
      setPasswordError("");
      setPasswordSuccess(false);
      setOldPassword("");
      setNewPassword("");
    }
  }, [isOpen]); // Handle photo upload
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

  // Handle account details update
  const handleAccountUpdate = async () => {
    setAccountError("");
    setAccountSuccess(false);

    // Check if anything changed
    if (newUsername === username && newEmail === email) {
      // No changes made - do nothing
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail !== email && !emailRegex.test(newEmail)) {
      setAccountError("Please enter a valid email address");
      return;
    }

    // Validate username (not empty and reasonable length)
    if (newUsername !== username) {
      if (newUsername.trim().length === 0) {
        setAccountError("Username cannot be empty");
        return;
      }
      if (newUsername.length < 3) {
        setAccountError("Username must be at least 3 characters long");
        return;
      }
      if (newUsername.length > 50) {
        setAccountError("Username cannot exceed 50 characters");
        return;
      }
    }

    try {
      const updateData = {};
      if (newUsername !== username) updateData.username = newUsername;
      if (newEmail !== email) updateData.user_email = newEmail;

      await axios.put("http://localhost:3001/users/profile", updateData);

      // Update current values
      setUsername(newUsername);
      setEmail(newEmail);

      // Dispatch event to notify other components if username changed
      if (newUsername !== username) {
        window.dispatchEvent(new CustomEvent("usernameUpdated"));
      }

      // Show success state
      setAccountSuccess(true);

      // Hide success state after 2 seconds
      setTimeout(() => {
        setAccountSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating account:", error);

      // Handle specific error codes
      if (error.response?.status === 409) {
        const errorMsg = error.response?.data?.message || "";
        if (errorMsg.toLowerCase().includes("email")) {
          setAccountError(
            "This email address is already registered to another account"
          );
        } else if (errorMsg.toLowerCase().includes("username")) {
          setAccountError(
            "This username is already taken. Please choose a different one"
          );
        } else {
          setAccountError("Username or email already in use");
        }
      } else if (error.response?.status === 400) {
        setAccountError("Invalid input. Please check your username and email");
      } else if (error.response?.status === 404) {
        setAccountError("User account not found. Please try logging in again");
      } else if (!error.response) {
        setAccountError("Network error. Please check your internet connection");
      } else {
        setAccountError(
          error.response?.data?.message ||
            "Unable to update account details. Please try again"
        );
      }
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    // Validate old password is provided
    if (!oldPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    // Validate new password is provided
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }

    // Validate new password length
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    // Check if new password is same as old
    if (newPassword === oldPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    // Check password strength (optional)
    if (newPassword.length < 8) {
      // Just a warning, not blocking
      console.warn("Password is less than 8 characters");
    }

    try {
      await axios.post("http://localhost:3001/users/change-password", {
        oldPassword,
        newPassword,
      });

      // Clear password fields
      setOldPassword("");
      setNewPassword("");

      // Show success state
      setPasswordSuccess(true);

      // Hide success state after 2 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle specific error codes
      if (error.response?.status === 401) {
        setPasswordError(
          "Current password is incorrect. Please check and try again"
        );
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || "";
        if (errorMsg.toLowerCase().includes("required")) {
          setPasswordError("Both current and new password are required");
        } else {
          setPasswordError("Invalid password format. Please try again");
        }
      } else if (error.response?.status === 404) {
        setPasswordError("User account not found. Please try logging in again");
      } else if (!error.response) {
        setPasswordError(
          "Network error. Please check your internet connection"
        );
      } else {
        setPasswordError(
          error.response?.data?.message ||
            "Unable to change password. Please try again"
        );
      }
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

          {/* Change Account Details Section */}
          <div className="setting-section">
            <h3>Change Account Details</h3>

            <div className="setting-item">
              <label>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
              <span className="current-value">Current: {username}</span>
            </div>

            <div className="setting-item">
              <label>Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
              <span className="current-value">Current: {email}</span>
            </div>

            {accountError && (
              <div className="error-message">{accountError}</div>
            )}

            <button
              className={`section-save-button ${
                accountSuccess ? "success-state" : ""
              }`}
              onClick={handleAccountUpdate}
            >
              {accountSuccess ? "✓ Changes Saved" : "Save Account Details"}
            </button>
          </div>

          {/* Change Password Section */}
          <div className="setting-section">
            <h3>Change Password</h3>

            <div className="setting-item">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="setting-item">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}

            <button
              className={`section-save-button ${
                passwordSuccess ? "success-state" : ""
              }`}
              onClick={handlePasswordChange}
            >
              {passwordSuccess
                ? "✓ Password Changed Successfully"
                : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
