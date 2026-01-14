import React from "react";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/upload.module.css";

function UploadPage({ 
  fadeIn, 
  isDragging,
  error,
  onDragEnter, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileSelect 
}) {
  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      <h1 className={commonStyles.mainTitle}>Crop Images</h1>
      
      {error && (
        <div className={commonStyles.errorBox}>
          {error}
        </div>
      )}
      
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
            accept="image/*"
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
