import React from "react";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/uploading.module.css";

function ProcessingPage({ fadeIn, processingProgress = 0 }) {
  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={commonStyles.spinner}></div>
        <p className={styles.uploadingText}>Processing cropped images...</p>
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
