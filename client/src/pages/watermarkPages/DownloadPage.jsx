import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";

function DownloadPage({ fadeIn, onDownload, onReset }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.downloadContainer}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.downloadTitle}>Watermark Added Successfully!</h2>
        <p className={styles.downloadMessage}>
          Your file has been watermarked and is ready to download.
        </p>

        <button className={styles.downloadButton} onClick={onDownload}>
          Download File
        </button>
        <button className={styles.backToHomeButton} onClick={onReset}>
          Add Watermark to Another File
        </button>
      </div>
    </div>
  );
}

export default DownloadPage;
