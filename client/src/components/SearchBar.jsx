import React from "react";
import styles from "../CSS/adminDashboard.module.css";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className={styles["search-box"]}>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className={styles["filter-btn"]}></button>
    </div>
  );
}

export default SearchBar;
