import React from "react";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/complete.module.css";

function DownloadPage({
  fadeIn,
  isDownloading,
  downloadProgress,
  hasDownloaded,
  handleDownload,
  handleReset,
}) {
  console.log('DownloadPage render:', { isDownloading, downloadProgress, hasDownloaded, fadeIn });
  
  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      {/* Download Loading Overlay */}
      {isDownloading && (
        <div className={`${styles.downloadingContainer} ${commonStyles.fadeIn}`}>
          <div className={commonStyles.spinner}></div>
          <p className={styles.downloadingText}>Downloading file...</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{downloadProgress}%</p>
        </div>
      )}

      {!isDownloading && (
        <div className={`${styles.completeContainer} ${commonStyles.fadeIn}`}>
          <div className={styles.successIconWrapper}>
            <div className={styles.successIconCircle}>
              <div className={styles.successIcon}>✓</div>
            </div>
          </div>
          {!hasDownloaded ? (
            <>
              <h2 className={styles.completeTitle}>Processing Complete!</h2>
              <p className={styles.completeMessage}>
                Your image has been successfully processed
              </p>
            </>
          ) : (
            <h2 className={styles.completeTitle}>File Downloaded Successfully!</h2>
          )}

          {!hasDownloaded && (
            <button
              className={styles.downloadButton}
              onClick={handleDownload}
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
                  Download File
                </>
              )}
            </button>
          )}
          <button className={styles.cropAnotherBtn} onClick={handleReset}>
            Edit Another Image
          </button>
        </div>
      )}
    </div>
  );
}

export default DownloadPage;
