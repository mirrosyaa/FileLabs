import React from "react";
import styles from "../../CSS/Pages/compressor.module.css";

function ProcessingPage({ fadeIn, processingProgress }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.uploadingText}>Processing video resolution...</p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${processingProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{processingProgress}%</p>
      </div>
    </div>
  );
}

export default ProcessingPage;
