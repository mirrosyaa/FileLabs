import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";
import compressorStyles from "../../CSS/Pages/compressor.module.css";
import pdfStyles from "../../CSS/Pages/pdfUpload.module.css";

function UploadPage({ 
  fadeIn, 
  isDragging, 
  onDragEnter, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileSelect,
  files,
  onRemoveFile,
  onContinue,
  error
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <h1 className={styles.mainTitle}>PDF Split & Merge</h1>
      
      {files.length === 0 ? (
        <div 
          className={`${compressorStyles.uploadBox} ${isDragging ? compressorStyles.dragging : ''}`}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className={compressorStyles.uploadIcon}>📄</div>
          <p className={compressorStyles.uploadText}>Drag & drop PDF files here</p>
          <label className={compressorStyles.browseBtn}>
            Browse Files
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={onFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      ) : (
        <div 
          className={`${pdfStyles.uploadContainer} ${isDragging ? pdfStyles.dragging : ''}`}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className={pdfStyles.uploadIcon}>📄</div>
          <p className={pdfStyles.uploadText}>
            {files.length} file{files.length > 1 ? 's' : ''} added
          </p>
          
          <div className={pdfStyles.fileListContainer}>
            {files.map((file, index) => (
              <div key={index} className={pdfStyles.fileItem}>
                <div className={pdfStyles.fileIcon}>📄</div>
                <div className={pdfStyles.fileInfo}>
                  <div className={pdfStyles.fileName}>{file.name}</div>
                  <div className={pdfStyles.fileSize}>{formatFileSize(file.size)}</div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className={pdfStyles.removeButton}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className={pdfStyles.buttonGroup}>
            <label className={pdfStyles.actionButton}>
              Add More Files
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={onFileSelect}
                style={{ display: 'none' }}
              />
            </label>
            
            <button 
              className={pdfStyles.actionButton}
              onClick={onContinue}
            >
              Continue with {files.length} file{files.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 59, 48, 0.2)',
          border: '1px solid rgba(255, 59, 48, 0.5)',
          borderRadius: '12px',
          color: '#ff3b30',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};


export default UploadPage;
