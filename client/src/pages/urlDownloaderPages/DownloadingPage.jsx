import React from "react";
import styles from "../../CSS/Pages/urlDownloader.module.css";

function DownloadingPage({ fadeIn, downloadProgress }) {
  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      <div className={styles.downloadingContainer}>
        <div className={styles.spinner}></div>
        <h2 className={styles.downloadingTitle}>Downloading...</h2>
        <p className={styles.downloadingText}>
          Please wait while we prepare your file
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${downloadProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{downloadProgress}%</p>
      </div>
    </div>
  );
}

export default DownloadingPage;
