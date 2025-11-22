import React from "react";
import styles from "../CSS/homePage.module.css";

function ActivityItem({ icon, title, time }) {
  return (
    <div className={styles["activity-item"]}>
      <div className={styles["activity-icon"]}>{icon}</div>
      <div className={styles["activity-content"]}>
        <p className={styles["activity-title"]}>{title}</p>
        <p className={styles["activity-time"]}>{time}</p>
      </div>
    </div>
  );
}

export default ActivityItem;
