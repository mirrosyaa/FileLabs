import React from "react";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/complete.module.css";

function CompletePage({ fadeIn, onReset }) {
  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      <div className={styles.completeContainer}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.completeTitle}>Images Cropped Successfully!</h2>
        <p className={styles.completeMessage}>
          Your cropped images have been downloaded automatically.
        </p>
        <button className={styles.cropAnotherBtn} onClick={onReset}>
          Crop More Images
        </button>
      </div>
    </div>
  );
}

export default CompletePage;
