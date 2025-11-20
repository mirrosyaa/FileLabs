import React from "react";
import styles from "../CSS/loadingScreen.module.css";

function LoadingScreen() {
  return (
    <div className={styles["loading-screen"]}>
      <div className={styles["loader"]}>
        {/* File icon spinner */}
        <svg
          className={styles["file-spinner"]}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <p className={styles["loading-text"]}>Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
