import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";

function UploadingPage({ fadeIn, uploadProgress }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={styles.spinner}></div>
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
