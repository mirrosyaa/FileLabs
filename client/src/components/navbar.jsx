import React, { useState, useEffect } from "react";
import "../CSS/navbar.css";
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

  // Fetch and set user's profile photo on mount
  useEffect(() => {
    loadUserPhoto();
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
      if (
        dropdownOpen &&
        !event.target.closest(".profile-dropdown-container")
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
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/home">FileLabs</Link>
      </div>

      <div className="nav-center">
        <button className="nav-button">Button 1</button>
        <button className="nav-button">Button 2</button>
        <button className="nav-button">Button 3</button>
      </div>

      <div className="nav-right">
        <div className="profile-dropdown-container">
          <img
            src={profilePhoto}
            alt="profile"
            className="profile-photo"
            onClick={toggleDropdown}
          />

          {dropdownOpen && (
            <div className="profile-dropdown">
              <button
                className="dropdown-item"
                onClick={() => {
                  setSettingsModalOpen(true);
                  setDropdownOpen(false);
                }}
              >
                Settings
              </button>
              <button className="dropdown-item" onClick={handleLogoutClick}>
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
