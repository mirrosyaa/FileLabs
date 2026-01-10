import React, { useRef, useState } from "react";
import styles from "../../CSS/Components/dropbox.module.css";

function DropBox({ onFilesSelected }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChoose = () => inputRef.current?.click();
  
  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      if (onFilesSelected) {
        onFilesSelected(selectedFiles);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      if (onFilesSelected) {
        onFilesSelected(droppedFiles);
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  return (
    <div className={styles.dropboxPage}>
      <div className={styles.dropboxWrapper}>
        <div 
          className={`${styles.dropbox} ${isDragging ? styles.dropboxDragging : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.uploadIcon}>📁</div>
          <p className={styles.dropboxHint}>
            {isDragging ? "Drop files here" : "Drag files here"}
          </p>
          <p className={styles.dropboxSubtext}>or</p>

          <button
            type="button"
            onClick={handleChoose}
            className={styles.chooseBtn}
          >
            Choose Files
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleChange}
            className={styles.fileInput}
          />

          {files.length > 0 && (
            <div className={styles.selectedFilesContainer}>
              <p className={styles.selectedFilesTitle}>
                {files.length} file{files.length > 1 ? "s" : ""} selected:
              </p>
              <div className={styles.selectedFilesList}>
                {files.map((file, idx) => (
                  <div key={idx} className={styles.selectedFileItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileIcon}>📄</span>
                      <span className={styles.selectedFileName}>{file.name}</span>
                      <span className={styles.fileSize}>
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFile(idx)}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DropBox;
