import React from "react";
import "../CSS/navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
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
        <Link to="/profile" className="profile-link">Profile</Link>
      </div>
    </nav>
  );
}
export default Navbar;
