import React, { useState } from "react";
import axios from "axios";
import styles from "../CSS/Modals/addUserModal.module.css";

function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Frontend validation
    if (!username || username.length < 3 || username.length > 50) {
      setError("Username must be between 3 and 50 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:3001/users/register", {
        username: username,
        user_email: email,
        user_password: password,
        user_type: userType,
      });

      setSuccess(true);

      // Clear form
      setUsername("");
      setEmail("");
      setPassword("");
      setUserType("user");

      // Notify parent to refresh user list
      if (onUserAdded) {
        onUserAdded();
      }

      // Close modal after 1 second
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Error adding user:", err);
      if (err.response?.status === 409) {
        // Handle duplicate username or email
        const errorMsg = err.response.data.message || "";
        if (errorMsg.toLowerCase().includes("username")) {
          setError("Username already taken");
        } else if (errorMsg.toLowerCase().includes("email")) {
          setError("Email already registered");
        } else {
          setError("User already exists");
        }
      } else {
        setError(err.response?.data?.message || "Failed to add user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setUsername("");
      setEmail("");
      setPassword("");
      setUserType("user");
      setError("");
      setSuccess(false);
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`${styles["modal-overlay"]} ${
        isClosing ? styles.closing : ""
      }`}
      onClick={handleClose}
    >
      <div
        className={styles["modal-content"]}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles["close-btn"]} onClick={handleClose}>
          ✕
        </button>

        <h2 className={styles["modal-title"]}>Add New User</h2>

        <form onSubmit={handleSubmit} className={styles["settings-form"]}>
          <div className={styles["form-section"]}>
            <h3>User Details</h3>

            <div className={styles["form-group"]}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="userType">User Type</label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="user">👥 User</option>
                <option value="admin">👤 Admin</option>
              </select>
            </div>

            {error && (
              <div className={styles["error-message-modal"]}>{error}</div>
            )}
            {success && (
              <div className={styles["success-message-modal"]}>
                User added successfully!
              </div>
            )}

            <button
              type="submit"
              className={`${styles["save-btn"]} ${
                success ? styles.success : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : success ? "✓ Added!" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
