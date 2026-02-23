import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";

function ProcessingPage({ fadeIn }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.uploadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.uploadingText}>Adding watermark...</p>
        <p className={styles.uploadingSubtext}>
          This may take a moment depending on file size
        </p>
      </div>
    </div>
  );
}

export default ProcessingPage;
