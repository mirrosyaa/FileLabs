import React from "react";
import "../CSS/adminDashboard.css";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="filter-btn"></button>
    </div>
  );
}

export default SearchBar;
