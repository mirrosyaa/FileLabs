import React from "react";
import styles from "../../CSS/Pages/urlDownloader.module.css";

function FetchingPage({ fadeIn, fetchProgress }) {
  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      <div className={styles.fetchingContainer}>
        <div className={styles.spinner}></div>
        <h2 className={styles.fetchingTitle}>Fetching Media Info...</h2>
        <p className={styles.fetchingText}>
          Getting video details and available formats
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${fetchProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{fetchProgress}%</p>
      </div>
    </div>
  );
}

export default FetchingPage;
