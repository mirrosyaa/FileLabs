import React, { useState } from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";
import pdfStyles from "../../CSS/Pages/pdfUpload.module.css";

function ProcessingPage({
  fadeIn,
  isProcessing,
  processingProgress,
  files,
  selectedOperation,
  setSelectedOperation,
  handleProcess,
  handleReset,
  onReorderFiles,
  error,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleFileDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFileDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleFileDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorderFiles(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleFileDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  // Disable split if there are multiple files
  const canSplit = files.length === 1;

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
                onClick={() => canSplit && setSelectedOperation("split")}
                disabled={!canSplit}
                style={{
                  opacity: canSplit ? 1 : 0.5,
                  cursor: canSplit ? 'pointer' : 'not-allowed'
                }}
              >
                <span className={styles.formatName}>Split PDF</span>
                <span className={styles.formatDescription}>
                  {canSplit ? "Extract pages from PDF" : "Only works with single PDF"}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.filesDisplay}>
            <div className={styles.filesHeader}>
              Selected Files:
              {selectedOperation === "merge" && files.length > 1 && (
                <span style={{ 
                  fontSize: '0.8em', 
                  color: '#007aff', 
                  marginLeft: '12px', 
                  fontWeight: '500',
                  background: 'rgba(0, 122, 255, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '1.1em' }}>⋮⋮</span> Drag to reorder
                </span>
              )}
            </div>
            <div className={styles.fileNames}>
              {selectedOperation === "merge" ? (
                files.map((file, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.fileName} ${draggedIndex === idx ? pdfStyles.dragging : ''} ${dragOverIndex === idx ? pdfStyles.dragOver : ''}`}
                    draggable={files.length > 1}
                    onDragStart={(e) => handleFileDragStart(e, idx)}
                    onDragOver={(e) => handleFileDragOver(e, idx)}
                    onDragEnd={handleFileDragEnd}
                    onDragLeave={handleFileDragLeave}
                    style={{ 
                      cursor: files.length > 1 ? 'move' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px'
                    }}
                  >
                    {files.length > 1 && (
                      <span style={{ marginRight: '8px', color: '#666' }}>⋮⋮</span>
                    )}
                    <span style={{ marginRight: '8px', color: '#888' }}>{idx + 1}.</span>
                    {file.name}
                  </div>
                ))
              ) : (
                files.map((file, idx) => (
                  <div key={idx} className={styles.fileName}>
                    {file.name}
                  </div>
                ))
              )}
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
