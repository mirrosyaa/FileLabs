import React from "react";
import styles from "../../../CSS/Pages/fileConverter.module.css";

function TextControls({ 
  watermarkText,
  setWatermarkText,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  watermarkColor,
  setWatermarkColor,
  strokeEnabled,
  setStrokeEnabled,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth
}) {
  const fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana", "Impact"];

  return (
    <>
      <div className={styles.formatOptions}>
        <label className={styles.formatLabel}>Watermark Text</label>
        <input
          type="text"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(94, 200, 255, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box'
          }}
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          placeholder="Enter watermark text..."
          maxLength={200}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label className={styles.formatLabel} style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(94, 200, 255, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font} style={{ background: '#1a2942' }}>{font}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.formatLabel} style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Size</label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(94, 200, 255, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {fontSize}%
          </div>
        </div>

        <div>
          <label className={styles.formatLabel} style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Color</label>
          <input
            type="color"
            value={watermarkColor}
            onChange={(e) => setWatermarkColor(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(94, 200, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className={styles.formatLabel} style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Font Size
        </label>
        <input
          type="range"
          min="1"
          max="20"
          step="0.5"
          value={fontSize}
          onChange={(e) => setFontSize(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={strokeEnabled}
            onChange={(e) => setStrokeEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label className={styles.formatLabel} style={{ fontSize: '14px', margin: 0 }}>Text Stroke</label>
        </div>
        {strokeEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '6px' }}>Color</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(94, 200, 255, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '6px' }}>Width: {strokeWidth}px</label>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TextControls;
