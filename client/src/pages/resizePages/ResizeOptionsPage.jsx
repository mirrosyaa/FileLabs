import React, { useState } from "react";
import styles from "../../CSS/Pages/imageResize.module.css";

function ResizeOptionsPage({ fadeIn, files, onResize, onBack }) {
  const [resizeMethod, setResizeMethod] = useState("preset"); // preset, custom, percentage
  const [presetSize, setPresetSize] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percentage, setPercentage] = useState(100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // Common preset sizes
  const presetSizes = [
    { label: "Instagram Square", width: 1080, height: 1080 },
    { label: "Instagram Portrait", width: 1080, height: 1350 },
    { label: "Instagram Landscape", width: 1080, height: 566 },
    { label: "Facebook Post", width: 1200, height: 630 },
    { label: "Twitter Post", width: 1200, height: 675 },
    { label: "YouTube Thumbnail", width: 1280, height: 720 },
    { label: "Full HD", width: 1920, height: 1080 },
    { label: "4K", width: 3840, height: 2160 },
    { label: "HD Ready", width: 1280, height: 720 },
    { label: "Profile Picture", width: 500, height: 500 },
  ];

  const handleSubmit = () => {
    let options = {
      method: resizeMethod,
      maintainAspectRatio: maintainAspectRatio
    };

    if (resizeMethod === "preset") {
      const selected = presetSizes.find(p => p.label === presetSize);
      options.width = selected.width;
      options.height = selected.height;
      options.maintainAspectRatio = false; // Preset sizes are exact
    } else if (resizeMethod === "custom") {
      options.width = parseInt(width) || null;
      options.height = parseInt(height) || null;
    } else if (resizeMethod === "percentage") {
      options.percentage = percentage;
    }

    onResize(options);
  };

  const isValid = () => {
    if (resizeMethod === "preset") {
      return presetSize !== "";
    }
    if (resizeMethod === "custom") {
      return width || height;
    }
    if (resizeMethod === "percentage") {
      return percentage > 0 && percentage <= 500;
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
              className={`${styles.formatOption} ${resizeMethod === "preset" ? styles.selectedFormat : ""}`}
              onClick={() => setResizeMethod("preset")}
            >
              <div className={styles.formatName}>Preset Sizes</div>
              <div className={styles.formatDescription}>Common formats</div>
            </button>
            <button
              className={`${styles.formatOption} ${resizeMethod === "custom" ? styles.selectedFormat : ""}`}
              onClick={() => setResizeMethod("custom")}
            >
              <div className={styles.formatName}>Custom Size</div>
              <div className={styles.formatDescription}>Set dimensions</div>
            </button>
            <button
              className={`${styles.formatOption} ${resizeMethod === "percentage" ? styles.selectedFormat : ""}`}
              onClick={() => setResizeMethod("percentage")}
            >
              <div className={styles.formatName}>Scale</div>
              <div className={styles.formatDescription}>By percentage</div>
            </button>
          </div>
        </div>

        {/* Preset Sizes Method */}
        {resizeMethod === "preset" && (
          <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.label}>Select Preset Size</label>
            <select
              className={styles.input}
              value={presetSize}
              onChange={(e) => setPresetSize(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Choose a size...</option>
              {presetSizes.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label} ({preset.width} × {preset.height})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Dimensions Method */}
        {resizeMethod === "custom" && (
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

        {resizeMethod === "custom" && (
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
