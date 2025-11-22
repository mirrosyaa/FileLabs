import React from "react";
import styles from "../CSS/adminDashboard.module.css";

function AdminHeader() {
  return (
    <header className={styles["dashboard-header"]}>
      <h1>Admin Dashboard</h1>
    </header>
  );
}

export default AdminHeader;
