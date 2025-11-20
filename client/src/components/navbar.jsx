import React, { useState, useEffect } from "react";
import styles from "../CSS/navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import defaultPhoto from "../media/defaultProfile.jpg";
import { useAuth } from "../Authentication/authProvider";
import SettingsModal from "../modals/settingsModal";
import LogoutModal from "../modals/logoutModal";

function Navbar() {
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { setToken } = useAuth();
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  // Function to load user photo
  const loadUserPhoto = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/users/my-profile-photo",
        { responseType: "blob" }
      );
      const photoUrl = URL.createObjectURL(response.data);
      setProfilePhoto(photoUrl);
    } catch (err) {
      console.error("Error fetching profile photo:", err);
      setProfilePhoto(defaultPhoto);
    }
  };

  // Fetch user profile to get user type
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users/profile");
      setUserType(response.data.user.user_type);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Fetch and set user's profile photo on mount
  useEffect(() => {
    loadUserPhoto();
    fetchUserProfile();
  }, []);

  // Listen for profile photo updates from settings modal
  useEffect(() => {
    const handlePhotoUpdate = () => {
      console.log("Profile photo updated, reloading...");
      loadUserPhoto();
    };

    window.addEventListener("profilePhotoUpdated", handlePhotoUpdate);

    return () => {
      window.removeEventListener("profilePhotoUpdated", handlePhotoUpdate);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
    setDropdownOpen(false);
  };

  const confirmLogout = () => {
    setToken(null); // Clear the token
    navigate("/"); // Redirect to login page
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownContainer = document.querySelector(
        `.${styles["profile-dropdown-container"]}`
      );
      if (
        dropdownOpen &&
        dropdownContainer &&
        !dropdownContainer.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles["nav-brand"]}>
        <Link to="/home">FileLabs</Link>
      </div>

      <div className={styles["nav-center"]}>
        <button className={styles["nav-button"]}>Button 1</button>
        <button className={styles["nav-button"]}>Button 2</button>
        <button className={styles["nav-button"]}>Button 3</button>
      </div>

      <div className={styles["nav-right"]}>
        <div className={styles["profile-dropdown-container"]}>
          <img
            src={profilePhoto}
            alt="profile"
            className={styles["profile-photo"]}
            onClick={toggleDropdown}
          />

          {dropdownOpen && (
            <div className={styles["profile-dropdown"]}>
              {/* Show Admin Dashboard link only for admin users */}
              {userType === "admin" && (
                <Link
                  to="/admin"
                  className={styles["dropdown-item"]}
                  onClick={() => setDropdownOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                className={styles["dropdown-item"]}
                onClick={() => {
                  setSettingsModalOpen(true);
                  setDropdownOpen(false);
                }}
              >
                Settings
              </button>
              <button
                className={styles["dropdown-item"]}
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </nav>
  );
}
export default Navbar;
