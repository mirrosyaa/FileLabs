import React, { useState } from "react";
import styles from "../../CSS/Pages/imageResize.module.css";

function ResizeOptionsPage({ fadeIn, files, onResize, onBack }) {
  const [resizeMethod, setResizeMethod] = useState("dimensions"); // dimensions, percentage, aspectRatio
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percentage, setPercentage] = useState(100);
  const [aspectRatio, setAspectRatio] = useState("free");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const aspectRatios = [
    { value: "free", label: "Free", ratio: null },
    { value: "1:1", label: "1:1 (Square)", ratio: 1 },
    { value: "4:3", label: "4:3", ratio: 4/3 },
    { value: "16:9", label: "16:9 (Widescreen)", ratio: 16/9 },
    { value: "3:2", label: "3:2", ratio: 3/2 },
    { value: "21:9", label: "21:9 (Ultra Wide)", ratio: 21/9 }
  ];

  const handleSubmit = () => {
    const options = {
      method: resizeMethod,
      width: parseInt(width) || null,
      height: parseInt(height) || null,
      percentage: percentage,
      aspectRatio: aspectRatio,
      maintainAspectRatio: maintainAspectRatio
    };
    onResize(options);
  };

  const isValid = () => {
    if (resizeMethod === "dimensions") {
      return width || height;
    }
    if (resizeMethod === "percentage") {
      return percentage > 0 && percentage <= 500;
    }
    if (resizeMethod === "aspectRatio") {
      return aspectRatio !== "free" && (width || height);
    }
    return false;
  };

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.conversionBox}>
        <button className={styles.backLink} onClick={onBack}>
          ← Back to upload
        </button>

        <h2 className={styles.conversionTitle}>Resize Options</h2>
        
        <div className={styles.filesDisplay}>
          <p className={styles.filesHeader}>
            {files.length} {files.length === 1 ? 'image' : 'images'} selected
          </p>
        </div>

        {/* Method Selection */}
        <div className={styles.formatOptions}>
          <p className={styles.formatLabel}>Choose Resize Method</p>
          <div className={styles.formatButtons}>
            <button
              className={`${styles.formatOption} ${resizeMethod === "dimensions" ? styles.selectedFormat : ""}`}
              onClick={() => setResizeMethod("dimensions")}
            >
              <div className={styles.formatIcon}>📏</div>
              <div className={styles.formatName}>Dimensions</div>
              <div className={styles.formatDescription}>Set width & height</div>
            </button>
            <button
              className={`${styles.formatOption} ${resizeMethod === "percentage" ? styles.selectedFormat : ""}`}
              onClick={() => setResizeMethod("percentage")}
            >
              <div className={styles.formatIcon}>📊</div>
              <div className={styles.formatName}>Percentage</div>
              <div className={styles.formatDescription}>Scale by %</div>
            </button>
            <button
              className={`${styles.formatOption} ${resizeMethod === "aspectRatio" ? styles.selectedFormat : ""}`}
              onClick={() => setResizeMethod("aspectRatio")}
            >
              <div className={styles.formatIcon}>📐</div>
              <div className={styles.formatName}>Aspect Ratio</div>
              <div className={styles.formatDescription}>Lock ratio</div>
            </button>
          </div>
        </div>

        {/* Dimensions Method */}
        {resizeMethod === "dimensions" && (
          <div className={styles.dimensionsGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Width (px)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="Auto"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="1"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Height (px)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="Auto"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="1"
              />
            </div>
          </div>
        )}

        {resizeMethod === "dimensions" && (
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              />
              Maintain aspect ratio
            </label>
          </div>
        )}

        {/* Percentage Method */}
        {resizeMethod === "percentage" && (
          <div className={styles.inputGroup} style={{ marginBottom: '30px' }}>
            <label className={styles.label}>Scale Percentage (1-500%)</label>
            <input
              type="number"
              className={styles.input}
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value) || 100)}
              min="1"
              max="500"
            />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '8px' }}>
              100% = original size, 50% = half size, 200% = double size
            </p>
          </div>
        )}

        {/* Aspect Ratio Method */}
        {resizeMethod === "aspectRatio" && (
          <>
            <div className={styles.formatOptions} style={{ marginBottom: '16px' }}>
              <p className={styles.formatLabel}>Select Aspect Ratio</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.value}
                    className={`${styles.compactFormatOption} ${aspectRatio === ar.value ? styles.selectedFormat : ""}`}
                    onClick={() => setAspectRatio(ar.value)}
                    style={{
                      padding: '10px 8px',
                      fontSize: '14px',
                      borderRadius: '12px',
                      background: aspectRatio === ar.value ? 'rgba(94, 200, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: aspectRatio === ar.value ? '2px solid #5ec8ff' : '2px solid rgba(94, 200, 255, 0.3)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '600'
                    }}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.dimensionsGrid} style={{ marginBottom: '12px' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Width (px)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="Auto"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="1"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Height (px)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="Auto"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              Enter one dimension, the other will be calculated
            </p>
          </>
        )}

        <button
          className={styles.convertButton}
          onClick={handleSubmit}
          disabled={!isValid()}
        >
          Resize Images
        </button>
      </div>
    </div>
  );
}

export default ResizeOptionsPage;
