import React from "react";
import commonStyles from "../../CSS/Pages/UrlDownloaderPages/common.module.css";
import styles from "../../CSS/Pages/UrlDownloaderPages/complete.module.css";

function DownloadingPage({ fadeIn, downloadProgress }) {
  return (
    <div
      className={`${commonStyles.pageContainer} ${
        fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut
      }`}
    >
      <div className={styles.downloadingContainer}>
        <div className={commonStyles.spinner}></div>
        <p className={styles.downloadingText}>Preparing your download...</p>
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
