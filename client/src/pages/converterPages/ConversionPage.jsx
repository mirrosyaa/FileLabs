import React from "react";
import styles from "../../CSS/Pages/fileConverter.module.css";
import { getConversionOptions } from "../../utils/fileConverterHelpers";

function ConversionPage({ 
  fadeIn, 
  isConverting, 
  conversionProgress, 
  hasMixedTypes, 
  primaryFileType, 
  files, 
  fileTypes, 
  selectedFormat, 
  setSelectedFormat, 
  handleConvert, 
  handleReset, 
  error 
}) {
  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      {/* Conversion Loading Overlay */}
      {isConverting && (
        <div className={styles.convertingOverlay}>
          <div className={styles.spinner}></div>
          <p className={styles.uploadingText}>Converting files...</p>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${conversionProgress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{conversionProgress}%</p>
        </div>
      )}

      <div className={styles.conversionBox}>
        <button className={styles.backLink} onClick={handleReset}>
          ← Back to upload
        </button>
        
        <h2 className={styles.conversionTitle}>Convert To</h2>
        
        {hasMixedTypes && (
          <div className={styles.warningBox}>
            ⚠️ Mixed file types detected. Please upload one type at a time.
          </div>
        )}

        {!hasMixedTypes && primaryFileType && primaryFileType !== 'unknown' && (
          <>
            {getConversionOptions(primaryFileType, files).length > 0 ? (
              <div className={styles.formatOptions}>
                <div className={styles.formatButtons}>
                  {getConversionOptions(primaryFileType, files).map((format) => (
                    <button
                      key={format.value}
                      className={`${styles.formatOption} ${selectedFormat === format.value ? styles.selectedFormat : ''}`}
                      onClick={() => setSelectedFormat(format.value)}
                    >
                      <span className={styles.formatIcon}>{format.icon}</span>
                      <span className={styles.formatName}>{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.errorBox}>
                ❌ {primaryFileType === 'document' || primaryFileType === 'audio' || primaryFileType === 'image'
                  ? 'No conversion options available. File is already in this format.'
                  : 'Only document, audio, and image conversions are currently supported.'}
              </div>
            )}

            <div className={styles.filesDisplay}>
              <div className={styles.filesHeader}>Selected Files:</div>
              {Object.entries(fileTypes).map(([type, typeFiles]) => (
                <div key={type} className={styles.fileTypeSection}>
                  <div className={styles.fileTypeLabel}>
                    {type === 'image' && '🖼️'}
                    {type === 'audio' && '🎵'}
                    {type === 'video' && '🎬'}
                    {type === 'document' && '📄'}
                    {type === 'unknown' && '❓'}
                    {' '}
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({typeFiles.length})
                  </div>
                  <div className={styles.fileNames}>
                    {typeFiles.map((file, idx) => (
                      <div key={idx} className={styles.fileName}>{file.name}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedFormat && getConversionOptions(primaryFileType, files).length > 0 && (
              <button 
                className={`${styles.convertButton} ${styles.slideIn}`}
                onClick={handleConvert}
                disabled={isConverting}
              >
                {isConverting ? (
                  <>
                    <span className={styles.buttonSpinner}></span>
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            )}
          </>
        )}

        {(primaryFileType === 'unknown' && !hasMixedTypes) && (
          <div className={styles.errorBox}>
            ❌ Unsupported file type. Please upload document, audio, or image files.
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversionPage;
