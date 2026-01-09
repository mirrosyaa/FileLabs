import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../CSS/Modals/userDetailsModal.module.css";
import defaultPhoto from "../media/defaultProfile.jpg";

function UserDetailsModal({
  isOpen,
  onClose,
  userId,
  onUserDeleted,
  currentAdminId,
}) {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [isUpdatingType, setIsUpdatingType] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Check if viewing own profile
  const isSelf = currentAdminId && userId === currentAdminId;

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile data
      const response = await axios.get(
        `http://localhost:3001/users/admin/users`
      );
      const foundUser = response.data.users.find((u) => u.userID === userId);

      if (foundUser) {
        setUser(foundUser);
        setSelectedUserType(foundUser.user_type);

        // Try to fetch profile photo
        try {
          const photoResponse = await axios.get(
            `http://localhost:3001/users/profile-photo/${userId}`,
            { responseType: "blob" }
          );
          const photoUrl = URL.createObjectURL(photoResponse.data);
          setProfilePhoto(photoUrl);
        } catch (photoErr) {
          console.log("No profile photo found, using default");
          setProfilePhoto(defaultPhoto);
        }
      } else {
        setError("User not found");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setUser(null);
      setProfilePhoto(defaultPhoto);
      setLoading(true);
      setError(null);
      setDeleteError(null);
      setSelectedUserType("");
      setUpdateSuccess(false);
      setUpdateError(null);
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleUpdateUserType = async () => {
    if (selectedUserType === user.user_type) {
      setUpdateError("No changes to save");
      return;
    }

    try {
      setIsUpdatingType(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      await axios.put(`http://localhost:3001/users/admin/user/${userId}/type`, {
        user_type: selectedUserType,
      });

      // Update local user state
      setUser({ ...user, user_type: selectedUserType });
      setUpdateSuccess(true);

      // Hide success message after 2 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);

      // Notify parent to refresh user list
      if (onUserDeleted) {
        onUserDeleted();
      }

      setIsUpdatingType(false);
    } catch (err) {
      console.error("Error updating user type:", err);
      setUpdateError(
        err.response?.data?.message || "Failed to update user type"
      );
      setIsUpdatingType(false);
    }
  };

  const handleDeleteUser = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await axios.delete(`http://localhost:3001/users/admin/user/${userId}`);

      // Notify parent to refresh user list
      if (onUserDeleted) {
        onUserDeleted();
      }

      // Close modal after successful deletion
      handleClose();
    } catch (err) {
      console.error("Error deleting user:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete user");
      setIsDeleting(false);
    }
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

        <h2 className={styles["modal-title"]}>User Details</h2>

        <div className={styles["modal-body"]}>
          l-body']}>
          {loading ? (
            <div className={styles["loading-state"]}>
              Loading user details...
            </div>
          ) : error ? (
            <div className={styles["error-state"]}>{error}</div>
          ) : user ? (
            <>
              <div className={styles["user-profile-section"]}>
                ection']}>
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className={styles["user-profile-photo"]}
                />
                <h3 className={styles["user-display-name"]}>{user.username}</h3>
                <span
                  className={`${styles["user-type-badge-large"]} ${
                    styles[user.user_type]
                  }`}
                >
                  {user.user_type === "admin" ? "👤 Admin" : "👥 User"}
                </span>
              </div>

              <div className={styles["user-info-section"]}>
                ection']}>
                <div className={styles["info-group"]}>
                  <label>Username</label>
                  <p>{user.username}</p>
                </div>
                <div className={styles["info-group"]}>
                  <label>Email Address</label>
                  <p>{user.user_email}</p>
                </div>
                <div className={styles["info-group"]}>
                  -group']}>
                  <label>User Type</label>
                  <div className={styles["user-type-update"]}>
                    <select
                      value={selectedUserType}
                      onChange={(e) => setSelectedUserType(e.target.value)}
                      className={styles["user-type-select"]}
                      disabled={isUpdatingType || isSelf}
                    >
                      <option value="user">👥 Regular User</option>
                      <option value="admin">👤 Administrator</option>
                    </select>
                    <button
                      className={`${styles["update-type-btn"]} ${
                        updateSuccess ? styles.success : ""
                      }`}
                      onClick={handleUpdateUserType}
                      disabled={
                        isUpdatingType ||
                        selectedUserType === user.user_type ||
                        isSelf
                      }
                    >
                      {isUpdatingType
                        ? "Saving..."
                        : updateSuccess
                        ? "✓ Saved!"
                        : "Save"}
                    </button>
                  </div>
                  {isSelf && (
                    <small className={styles["self-warning"]}>
                      You cannot change your own user type
                    </small>
                  )}
                </div>
                {updateError && (
                  <div className={styles["error-message-modal"]}>
                    {updateError}
                  </div>
                )}
                <div className={styles["info-group"]}>
                  <label>Account Created</label>
                  <p>
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(user.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className={styles["error-message-modal"]}>
                  {deleteError}
                </div>
              )}

              <div className={styles["modal-actions"]}>
                <button
                  className={styles["delete-user-btn"]}
                  onClick={handleDeleteUser}
                  disabled={isDeleting || isSelf}
                >
                  {isDeleting ? "Deleting..." : "🗑️ Delete User"}
                </button>
                {isSelf && (
                  <small className={styles["self-warning"]}>
                    You cannot delete your own account
                  </small>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
