import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";

function ProcessingPage({
  fadeIn,
  isProcessing,
  processingProgress,
  files,
  selectedOperation,
  setSelectedOperation,
  handleProcess,
  handleReset,
  error,
}) {
  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      {/* Processing Loading Overlay */}
      {isProcessing && (
        <div className={styles.uploadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.uploadingText}>
            {selectedOperation === "merge" ? "Merging PDFs..." : "Splitting PDF..."}
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{processingProgress}%</p>
        </div>
      )}

      {!isProcessing && (
        <div className={styles.conversionBox}>
          <button className={styles.backLink} onClick={handleReset}>
            ← Back to upload
          </button>

          <h2 className={styles.conversionTitle}>Select Operation</h2>

          <div className={styles.formatOptions}>
            <div className={styles.formatButtons}>
              <button
                className={`${styles.formatOption} ${
                  selectedOperation === "merge" ? styles.selectedFormat : ""
                }`}
                onClick={() => setSelectedOperation("merge")}
              >
                <span className={styles.formatName}>Merge PDFs</span>
                <span className={styles.formatDescription}>
                  Combine multiple PDFs into one
                </span>
              </button>
              
              <button
                className={`${styles.formatOption} ${
                  selectedOperation === "split" ? styles.selectedFormat : ""
                }`}
                onClick={() => setSelectedOperation("split")}
              >
                <span className={styles.formatName}>Split PDF</span>
                <span className={styles.formatDescription}>
                  Extract pages from PDF
                </span>
              </button>
            </div>
          </div>

          <div className={styles.filesDisplay}>
            <div className={styles.filesHeader}>Selected Files:</div>
            <div className={styles.fileNames}>
              {files.map((file, idx) => (
                <div key={idx} className={styles.fileName}>
                  {file.name}
                </div>
              ))}
            </div>
          </div>

          {selectedOperation && (
            <button
              className={`${styles.convertButton} ${styles.slideIn}`}
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Processing...
                </>
              ) : (
                <>
                  {selectedOperation === "merge" ? "Merge PDFs" : "Split PDF"}
                </>
              )}
            </button>
          )}

          {error && <div className={styles.errorBox}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default ProcessingPage;
