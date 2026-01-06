import React from "react";
import styles from "../CSS/welcomeSection.module.css";

function WelcomeSection({ greeting, username }) {
  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeContent}>
        <h1 className={styles.greeting}>
          {greeting}, <span className={styles.username}>{username}</span>!
        </h1>
        <p className={styles.subtitle}>
          What would you like to work on today?
        </p>
      </div>
    </div>
  );
}

export default WelcomeSection;
