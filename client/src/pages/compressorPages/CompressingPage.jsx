import React from "react";
import styles from "../../CSS/Pages/compressor.module.css";

function CompressingPage({ fadeIn, compressionProgress }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.uploadingText}>Compressing files...</p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${compressionProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{compressionProgress}%</p>
      </div>
    </div>
  );
}

export default CompressingPage;
