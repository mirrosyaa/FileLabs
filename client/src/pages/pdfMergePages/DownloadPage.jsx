import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";

function DownloadPage({
  fadeIn,
  isDownloading,
  downloadProgress,
  hasDownloaded,
  downloadFilename,
  selectedOperation,
  handleDownload,
  handleReset,
}) {
  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      {/* Download Loading Overlay */}
      {isDownloading && (
        <div className={`${styles.uploadingContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
          <div className={styles.spinner}></div>
          <p className={styles.uploadingText}>Downloading file...</p>
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
        <div className={styles.successContainer}>
          <div className={styles.successIconWrapper}>
            <div className={styles.successIconCircle}>
              <div className={styles.successIcon}>✓</div>
            </div>
          </div>
          {!hasDownloaded ? (
            <>
              <h2 className={styles.successTitle}>Processing Complete!</h2>
              <p className={styles.successMessage}>
                Your PDF has been successfully {selectedOperation === "merge" ? "merged" : "split"}
              </p>
            </>
          ) : (
            <h2 className={styles.successTitle}>File Downloaded Successfully!</h2>
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
          <button className={styles.newConversionBtn} onClick={handleReset}>
            Process Another PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default DownloadPage;
