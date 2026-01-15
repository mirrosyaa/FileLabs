import React from "react";
import styles from "../../CSS/Pages/urlDownloader.module.css";

function CompletePage({
  fadeIn,
  isDownloadingFile,
  downloadFileProgress,
  hasDownloaded,
  downloadFilename,
  selectedFormat,
  handleDownloadFile,
  handleReset,
}) {
  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      {/* Download Loading Overlay */}
      {isDownloadingFile && (
        <div
          className={`${styles.downloadingContainer} ${
            fadeIn ? styles.fadeIn : styles.fadeOut
          }`}
        >
          <div className={styles.spinner}></div>
          <p className={styles.downloadingText}>Downloading file...</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${downloadFileProgress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{downloadFileProgress}%</p>
        </div>
      )}

      {!isDownloadingFile && (
        <div className={styles.successContainer}>
          <div className={styles.successIconWrapper}>
            <div className={styles.successIconCircle}>
              <div className={styles.successIcon}>✓</div>
            </div>
          </div>

          {!hasDownloaded ? (
            <>
              <h2 className={styles.successTitle}>Ready to Download!</h2>
              <p className={styles.successMessage}>
                Your {selectedFormat === "audio" ? "audio" : "video"} file is
                ready
              </p>
            </>
          ) : (
            <h2 className={styles.successTitle}>
              File Downloaded Successfully!
            </h2>
          )}

          {!hasDownloaded && (
            <button
              className={styles.downloadButton}
              onClick={handleDownloadFile}
              disabled={isDownloadingFile}
            >
              {isDownloadingFile ? (
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

          <button className={styles.newDownloadBtn} onClick={handleReset}>
            Download Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default CompletePage;
