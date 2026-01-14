import React from "react";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/uploading.module.css";

function UploadingPage({ fadeIn, uploadProgress }) {
  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={commonStyles.spinner}></div>
        <p className={styles.uploadingText}>Uploading files...</p>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{uploadProgress}%</p>
      </div>
    </div>
  );
}

export default UploadingPage;
