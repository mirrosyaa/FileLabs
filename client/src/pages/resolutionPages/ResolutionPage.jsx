import React from "react";
import styles from "../../CSS/Pages/compressor.module.css";

function ResolutionPage({ 
  fadeIn,
  files, 
  selectedResolution, 
  setSelectedResolution, 
  error, 
  onProcess,
  onReset,
  formatFileSize 
}) {
  const resolutions = [
    { value: "480p", name: "480p (SD)", width: 854, height: 480 },
    { value: "720p", name: "720p (HD)", width: 1280, height: 720 },
    { value: "1080p", name: "1080p (Full HD)", width: 1920, height: 1080 },
    { value: "1440p", name: "1440p (2K)", width: 2560, height: 1440 },
    { value: "2160p", name: "2160p (4K)", width: 3840, height: 2160 },
    { value: "4320p", name: "4320p (8K)", width: 7680, height: 4320 }
  ];

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.compressionBox}>
        <button className={styles.backLink} onClick={onReset}>
          ← Back to upload
        </button>

        <h2 className={styles.compressionTitle} style={{ fontSize: '22px', marginBottom: '18px' }}>Choose Resolution</h2>
        
        {selectedResolution && (
          <div className={styles.currentLevelDisplay} style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '600',
            color: '#5ec8ff',
            marginBottom: '16px',
            padding: '10px',
            background: 'rgba(94, 200, 255, 0.1)',
            borderRadius: '10px',
            border: '2px solid rgba(94, 200, 255, 0.3)'
          }}>
            Selected: {resolutions.find(r => r.value === selectedResolution)?.name}
          </div>
        )}
        
        <div className={styles.compressionOptions}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
            {resolutions.map((resolution) => (
              <button
                key={resolution.value}
                onClick={() => setSelectedResolution(resolution.value)}
                className={`${styles.formatOption} ${selectedResolution === resolution.value ? styles.selectedFormat : ''}`}
                style={{
                  padding: '12px 10px',
                  background: selectedResolution === resolution.value 
                    ? 'rgba(94, 200, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedResolution === resolution.value
                    ? '2px solid #5ec8ff'
                    : '2px solid rgba(94, 200, 255, 0.2)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <div>{resolution.name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '3px' }}>
                  {resolution.width} × {resolution.height}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filesDisplay} style={{ marginBottom: '18px' }}>
          <div className={styles.filesHeader} style={{ fontSize: '15px', marginBottom: '10px' }}>Selected Files:</div>
          <div className={styles.fileNames}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileName} style={{ fontSize: '14px', padding: '8px 12px' }}>
                {file.name}
              </div>
            ))}
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <button 
          onClick={onProcess} 
          className={`${styles.convertButton} ${styles.slideIn}`}
          disabled={!selectedResolution}
          style={{ padding: '14px 28px', fontSize: '16px' }}
        >
          Change Resolution
        </button>
      </div>
    </div>
  );
}

export default ResolutionPage;
