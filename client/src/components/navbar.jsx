import React, { useState, useEffect } from "react";
import styles from "../CSS/navbar.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import defaultPhoto from "../media/defaultProfile.jpg";
import { useAuth } from "../Authentication/authProvider";
import SettingsModal from "../modals/settingsModal";
import LogoutModal from "../modals/logoutModal";

function Navbar() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
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
      // Silently fail for auth errors - user not logged in
      if (err.response?.status === 401 || err.response?.status === 403) {
        setProfilePhoto(defaultPhoto);
      } else {
        console.error("Error fetching profile photo:", err);
        setProfilePhoto(defaultPhoto);
      }
    }
  };

  // Fetch user profile to get user type
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users/profile");
      setUserType(response.data.user.user_type);
    } catch (err) {
      // Silently fail for auth errors - user not logged in
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error("Error fetching user profile:", err);
      }
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

  const toggleDropdown = (e) => {
    if (e) e.stopPropagation();
    const newState = !dropdownOpen;
    console.log("Toggle dropdown - New state will be:", newState);
    setDropdownOpen(newState);
  };

  const toggleToolsDropdown = (e) => {
    if (e) e.stopPropagation();
    setToolsDropdownOpen(!toolsDropdownOpen);
  };

  const handleLogoutClick = (e) => {
    if (e) e.stopPropagation();
    console.log("Logout clicked - Opening logout modal");
    setLogoutModalOpen(true);
    setDropdownOpen(false);
  };

  const handleSettingsClick = (e) => {
    if (e) e.stopPropagation();
    console.log("Settings clicked - Opening settings modal");
    setSettingsModalOpen(true);
    setDropdownOpen(false);
  };

  const confirmLogout = () => {
    console.log("Confirm logout - Clearing token and redirecting");
    setToken(null); // Clear the token
    navigate("/"); // Redirect to login page
  };

  console.log("Navbar render - settingsModalOpen:", settingsModalOpen, "logoutModalOpen:", logoutModalOpen, "dropdownOpen:", dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownContainer = document.querySelector(
        `.${styles["profile-dropdown-container"]}`
      );
      const toolsContainer = document.querySelector(
        `.${styles["tools-dropdown-container"]}`
      );
      
      if (
        dropdownOpen &&
        dropdownContainer &&
        !dropdownContainer.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      
      if (
        toolsDropdownOpen &&
        toolsContainer &&
        !toolsContainer.contains(event.target)
      ) {
        setToolsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, toolsDropdownOpen]);

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
        {/* Tools Dropdown */}
        <div className={styles["tools-dropdown-container"]}>
          <button 
            className={`${styles["nav-button"]} ${styles["tools-button"]}`}
            onClick={toggleToolsDropdown}
          >
            <span className={styles["button-label"]}>Tools</span>
            <span className={styles["dropdown-arrow"]}>{toolsDropdownOpen ? '▲' : '▼'}</span>
          </button>

          {toolsDropdownOpen && (
            <div className={styles["tools-dropdown"]}>
              <div className={styles["tools-section"]}>
                <div 
                  className={styles["tools-category"]}
                  onMouseEnter={() => setHoveredCategory('images')}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className={styles["category-header"]}>
                    <span className={styles["category-icon"]}>🖼️</span>
                    <span className={styles["category-title"]}>Image Tools</span>
                  </div>
                  {hoveredCategory === 'images' && (
                    <div className={styles["category-links"]}>
                      <Link to="/file-converter" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Convert</Link>
                      <Link to="/tools/images/compress" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Compress/Optimize</Link>
                      <Link to="/tools/images/resize" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Resize</Link>
                      <Link to="/tools/images/crop" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Crop</Link>
                      <Link to="/tools/images/metadata" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Add Metadata</Link>
                      <Link to="/tools/images/watermark" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Add Watermarks</Link>
                    </div>
                  )}
                </div>

                <div 
                  className={styles["tools-category"]}
                  onMouseEnter={() => setHoveredCategory('video')}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className={styles["category-header"]}>
                    <span className={styles["category-icon"]}>🎬</span>
                    <span className={styles["category-title"]}>Video Tools</span>
                  </div>
                  {hoveredCategory === 'video' && (
                    <div className={styles["category-links"]}>
                      <Link to="/tools/video/convert" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Convert</Link>
                      <Link to="/tools/video/compress" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Compress</Link>
                      <Link to="/tools/video/cut" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Cut/Trim</Link>
                      <Link to="/tools/video/merge" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Merge</Link>
                      <Link to="/tools/video/resolution" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Change Resolution</Link>
                      <Link to="/tools/video/extract-audio" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Extract Audio</Link>
                      <Link to="/tools/video/auto-split" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Auto Split</Link>
                    </div>
                  )}
                </div>

                <div 
                  className={styles["tools-category"]}
                  onMouseEnter={() => setHoveredCategory('audio')}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className={styles["category-header"]}>
                    <span className={styles["category-icon"]}>🎵</span>
                    <span className={styles["category-title"]}>Audio Tools</span>
                  </div>
                  {hoveredCategory === 'audio' && (
                    <div className={styles["category-links"]}>
                      <Link to="/file-converter" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Convert</Link>
                      <Link to="/tools/audio/trim" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Trim</Link>
                      <Link to="/tools/audio/merge" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Merge</Link>
                      <Link to="/tools/audio/compress" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Compress</Link>
                      <Link to="/tools/audio/metadata" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Edit Metadata</Link>
                      <Link to="/tools/audio/normalize" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Normalize Volume</Link>
                    </div>
                  )}
                </div>

                <div 
                  className={styles["tools-category"]}
                  onMouseEnter={() => setHoveredCategory('documents')}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className={styles["category-header"]}>
                    <span className={styles["category-icon"]}>📄</span>
                    <span className={styles["category-title"]}>Document Tools</span>
                  </div>
                  {hoveredCategory === 'documents' && (
                    <div className={styles["category-links"]}>
                      <Link to="/file-converter" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Convert</Link>
                      <Link to="/tools/documents/compress-pdf" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Compress PDF</Link>
                      <Link to="/tools/documents/merge-pdf" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Merge PDF</Link>
                      <Link to="/tools/documents/download-url" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Download from URL</Link>
                      <Link to="/tools/documents/auto-rename" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Auto Rename</Link>
                      <Link to="/tools/documents/extract-images" className={styles["tool-link"]} onClick={() => setToolsDropdownOpen(false)}>Extract Images</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles["profile-dropdown-container"]}>
          <div
            className={styles["profile-photo"]}
            onClick={toggleDropdown}
            style={{
              backgroundImage: profilePhoto ? `url(${profilePhoto})` : `url(${defaultPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#4a5568',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            {!profilePhoto && !defaultPhoto && '👤'}
          </div>

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
                onClick={handleSettingsClick}
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
