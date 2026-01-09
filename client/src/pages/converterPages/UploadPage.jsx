import React from "react";
import styles from "../../CSS/fileConverter.module.css";

function UploadPage({ 
  fadeIn, 
  isDragging, 
  onDragEnter, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileSelect 
}) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <h1 className={styles.mainTitle}>File Converter</h1>
      
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
    </div>
  );
}

export default UploadPage;
