import React from "react";
import styles from "../CSS/homePage.module.css";

function StatCard({ icon, value, label }) {
  return (
    <div className={styles["stat-card"]}>
      <div className={styles["stat-icon"]}>{icon}</div>
      <div className={styles["stat-content"]}>
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
