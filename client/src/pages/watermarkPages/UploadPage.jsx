import React, { useState } from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";
import compressorStyles from "../../CSS/Pages/compressor.module.css";

function UploadPage({ fadeIn, onFilesSelected, error }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <h1 className={styles.mainTitle}>💧 Add Watermark</h1>
      <div
        className={`${compressorStyles.uploadBox} ${isDragging ? compressorStyles.dragging : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={compressorStyles.uploadIcon}>📁</div>
        <p className={compressorStyles.uploadText}>
          Drag & drop your files here
        </p>
        <label className={compressorStyles.browseBtn}>
          Browse Files
          <input
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
            accept="video/*,image/*,.pdf"
          />
        </label>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}

export default UploadPage;
