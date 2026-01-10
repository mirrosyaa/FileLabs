import React from "react";
import styles from "../../CSS/Pages/homePage.module.css";

function ActionCard({ icon, title, description, onClick }) {
  return (
    <button className={styles["action-card"]} onClick={onClick}>
      <div className={styles["action-icon"]}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </button>
  );
}

export default ActionCard;
