import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";

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
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <h1 className={styles.mainTitle}>PDF Split & Merge</h1>
      
      <div 
        className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={styles.uploadIcon}>📄</div>
        <p className={styles.uploadText}>
          {files.length === 0 ? 'Add PDF files to merge or split' : `${files.length} file${files.length > 1 ? 's' : ''} added`}
        </p>
        
        {files.length > 0 && (
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            width: '100%', 
            marginBottom: '20px',
            padding: '0 20px'
          }}>
            {files.map((file, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 15px',
                margin: '5px 0',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}>
                <span style={{ fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {index + 1}. {file.name}
                </span>
                <button
                  onClick={() => onRemoveFile(index)}
                  style={{
                    background: 'rgba(255, 59, 48, 0.8)',
                    border: 'none',
                    color: '#fff',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '10px'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        
        <label className={styles.browseBtn} style={{ marginBottom: files.length > 0 ? '10px' : '0' }}>
          {files.length === 0 ? 'Browse Files' : 'Add More Files'}
          <input
            type="file"
            accept=".pdf"
            onChange={onFileSelect}
            style={{ display: 'none' }}
          />
        </label>
        
        {files.length > 0 && (
          <button 
            className={styles.browseBtn}
            onClick={onContinue}
            style={{
              background: 'linear-gradient(135deg, #34c759 0%, #30a14e 100%)',
              marginTop: '10px'
            }}
          >
            Continue with {files.length} file{files.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
      
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
