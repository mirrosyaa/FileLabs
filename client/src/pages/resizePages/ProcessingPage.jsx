import React from "react";
import styles from "../../CSS/Pages/imageResize.module.css";

function ProcessingPage({ fadeIn, processingProgress = 0 }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.uploadingText}>Resizing images...</p>
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
