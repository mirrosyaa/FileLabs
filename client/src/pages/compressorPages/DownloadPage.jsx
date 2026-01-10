import React from "react";
import styles from "../../CSS/Pages/compressor.module.css";

function DownloadPage({ 
  fadeIn,
  isDownloading, 
  hasDownloaded, 
  downloadProgress, 
  onDownload, 
  onReset 
}) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.successContainer}>
        <div className={styles.successIconWrapper}>
          <div className={styles.successIconCircle}>
            <div className={styles.successIcon}>✓</div>
          </div>
        </div>
        <h2 className={styles.successTitle}>Compression Complete!</h2>
        <p className={styles.successMessage}>
          Your files have been successfully compressed
        </p>

        <button
          className={styles.downloadButton}
          onClick={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <span className={styles.buttonSpinner}></span>
              Downloading...
            </>
          ) : (
            <>
              <span className={styles.downloadIcon}>⬇</span>
              Download Files
            </>
          )}
        </button>
        
        <button className={styles.newConversionBtn} onClick={onReset}>
          Compress Another File
        </button>
      </div>
    </div>
  );
}

export default DownloadPage;
