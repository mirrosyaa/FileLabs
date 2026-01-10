import React from "react";
import styles from "../CSS/homePage.module.css";

function WelcomeBanner({ greeting, username }) {
  return (
    <div className={styles["welcome-section"]}>
      <div className={styles["greeting-header"]}>
        <h1>
          {greeting}, {username || "User"}
        </h1>
      </div>
    </div>
  );
}

export default WelcomeBanner;
