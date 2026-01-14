import React from "react";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/uploading.module.css";

function CroppingPage({ fadeIn, croppingProgress = 0 }) {
  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={commonStyles.spinner}></div>
        <p className={styles.uploadingText}>Cropping image...</p>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${croppingProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{croppingProgress}%</p>
      </div>
    </div>
  );
}

export default CroppingPage;
