import React, { useState, useEffect } from "react";
import styles from "../CSS/navbar.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

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
        <Link
          to="/file-converter"
          className={`${styles["nav-button"]} ${
            location.pathname === "/file-converter" ? styles["active"] : ""
          }`}
        >
          <div className={styles["icon-circle"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span className={styles["button-label"]}>File Converter</span>
        </Link>
        <button className={styles["nav-button"]}>
          <div className={styles["icon-circle"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
          </div>
          <span className={styles["button-label"]}>Files</span>
        </button>
        <Link
          to="/home"
          className={`${styles["nav-button"]} ${
            location.pathname === "/home" ? styles["active"] : ""
          }`}
        >
          <div className={styles["icon-circle"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className={styles["button-label"]}>Home</span>
        </Link>
        <button className={styles["nav-button"]}>
          <div className={styles["icon-circle"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className={styles["button-label"]}>Folders</span>
        </button>
        <button className={styles["nav-button"]}>
          <div className={styles["icon-circle"]}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className={styles["button-label"]}>Starred</span>
        </button>
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
