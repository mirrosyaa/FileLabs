import React from "react";
import styles from "../../CSS/Pages/compressor.module.css";

function UploadPage({ fadeIn, isDragging, onDragEnter, onDragOver, onDragLeave, onDrop, onFileSelect, error, onReset }) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      {!error ? (
        <>
          <h1 className={styles.mainTitle}>File Compressor</h1>
          
          <div
            className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className={styles.uploadIcon}>📁</div>
            <p className={styles.uploadText}>Drag & drop files here</p>
            <label className={styles.browseBtn}>
              Browse Files
              <input
                type="file"
                multiple
                onChange={onFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </>
      ) : (
        <div className={styles.compressionBox}>
          <h2 className={styles.errorTitle}>Cannot Compress File</h2>
          <div className={styles.errorMessageBox}>
            {error}
          </div>
          <button className={styles.newConversionBtn} onClick={onReset}>
            Try Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
