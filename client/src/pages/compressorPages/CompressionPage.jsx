import React from "react";
import styles from "../../CSS/Pages/compressor.module.css";

function CompressionPage({ 
  fadeIn,
  files, 
  compressionLevel, 
  setCompressionLevel, 
  error, 
  onCompress,
  onReset,
  formatFileSize 
}) {
  const levels = [
    { value: 0, name: "Very Low" },
    { value: 1, name: "Low" },
    { value: 2, name: "Medium" },
    { value: 3, name: "Medium-High" },
    { value: 4, name: "High" },
    { value: 5, name: "Extreme" }
  ];

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setCompressionLevel(value);
  };

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.compressionBox}>
        <button className={styles.backLink} onClick={onReset}>
          ← Back to upload
        </button>

        <h2 className={styles.compressionTitle}>Choose Compression Level</h2>
        
        <div className={styles.compressionOptions}>
          <div className={styles.sliderContainer}>
            <div className={styles.sliderTicks}>
              {levels.map((level) => (
                <div key={level.value} className={styles.tick}></div>
              ))}
            </div>
            
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={compressionLevel}
              onChange={handleSliderChange}
              className={styles.compressionSlider}
            />
            
            <div className={styles.sliderLabels}>
              {levels.map((level) => (
                <span
                  key={level.value}
                  className={`${styles.sliderLabel} ${compressionLevel === level.value ? styles.activeLabel : ''}`}
                >
                  {level.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.filesDisplay}>
          <div className={styles.filesHeader}>Selected Files:</div>
          <div className={styles.fileNames}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileName}>
                {file.name}
              </div>
            ))}
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {compressionLevel && (
          <button onClick={onCompress} className={`${styles.convertButton} ${styles.slideIn}`}>
            Compress Files
          </button>
        )}
      </div>
    </div>
  );
}

export default CompressionPage;
