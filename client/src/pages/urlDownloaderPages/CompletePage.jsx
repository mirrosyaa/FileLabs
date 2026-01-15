import React from "react";
import commonStyles from "../../CSS/Pages/UrlDownloaderPages/common.module.css";
import styles from "../../CSS/Pages/UrlDownloaderPages/complete.module.css";

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
      className={`${commonStyles.pageContainer} ${
        fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut
      }`}
    >
      {/* Download Loading Overlay */}
      {isDownloadingFile && (
        <div className={`${styles.downloadingContainer} ${commonStyles.fadeIn}`}>
          <div className={commonStyles.spinner}></div>
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
        <div className={`${styles.completeContainer} ${commonStyles.fadeIn}`}>
          <div className={styles.successIconWrapper}>
            <div className={styles.successIconCircle}>
              <div className={styles.successIcon}>✓</div>
            </div>
          </div>

          {!hasDownloaded ? (
            <>
              <h2 className={styles.completeTitle}>Ready to Download!</h2>
              <p className={styles.completeMessage}>
                Your {selectedFormat === "audio" ? "audio" : "video"} file is ready
              </p>
            </>
          ) : (
            <h2 className={styles.completeTitle}>
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
