import React, { useState, useEffect } from "react";
import "../CSS/navbar.css";
import { Link } from "react-router-dom";
import axios from "axios";
import defaultPhoto from "../media/defaultProfile.jpg";

function Navbar() {
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);

  useEffect(() => {
    // Fetch user's profile photo from database
    const getUserPhoto = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/users/profilePhoto",
          { responseType: "blob" }
        );
        const photoUrl = URL.createObjectURL(response.data);
        setProfilePhoto(photoUrl); // Updates to user's photo
      } catch (err) {
        console.error("Error fetching profile photo:", err);
      }
    };

    getUserPhoto();

    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (profilePhoto !== defaultPhoto) {
        URL.revokeObjectURL(profilePhoto);
      }
    };
  });

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
        <Link to="/profile" className="profile-link">
          <img src={profilePhoto} alt="profile" className="profile-photo" />
        </Link>
      </div>
    </nav>
  );
}
export default Navbar;
