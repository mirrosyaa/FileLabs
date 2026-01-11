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
  const handleLevelChange = (level) => {
    console.log(`Compression level changed to: ${level}`);
    setCompressionLevel(level);
  };

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.compressionBox}>
        <button className={styles.backLink} onClick={onReset}>
          ← Back to upload
        </button>

        <h2 className={styles.compressionTitle}>Choose Compression Level</h2>
        
        <div className={styles.compressionOptions}>
          <div className={styles.levelButtons}>
            <button
              className={`${styles.levelOption} ${compressionLevel === "low" ? styles.selected : ""}`}
              onClick={() => handleLevelChange("low")}
            >
              <span className={styles.levelName}>LOW</span>
              <span className={styles.levelDescription}>Better quality</span>
            </button>
            <button
              className={`${styles.levelOption} ${compressionLevel === "medium" ? styles.selected : ""}`}
              onClick={() => handleLevelChange("medium")}
            >
              <span className={styles.levelName}>MEDIUM</span>
              <span className={styles.levelDescription}>Balanced</span>
            </button>
            <button
              className={`${styles.levelOption} ${compressionLevel === "high" ? styles.selected : ""}`}
              onClick={() => handleLevelChange("high")}
            >
              <span className={styles.levelName}>HIGH</span>
              <span className={styles.levelDescription}>Smaller size</span>
            </button>
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
