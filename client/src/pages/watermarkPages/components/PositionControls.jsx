import React from "react";
import styles from "../../../CSS/Pages/fileConverter.module.css";

function PositionControls({ 
  anchorPosition, 
  setAnchorPosition
}) {
  const anchorPositions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "middle-left", label: "Middle Left" },
    { value: "center", label: "Center" },
    { value: "middle-right", label: "Middle Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" }
  ];

  return (
    <div className={styles.formatOptions}>
      <label className={styles.formatLabel}>Position</label>
      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '12px', textAlign: 'center' }}>
        Click a preset or drag watermark in preview
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        maxWidth: '280px',
        margin: '0 auto 16px'
      }}>
        {anchorPositions.map((pos) => (
          <button
            key={pos.value}
            className={`${styles.formatOption} ${anchorPosition === pos.value ? styles.selectedFormat : ""}`}
            onClick={() => setAnchorPosition(pos.value)}
            style={{
              padding: '12px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PositionControls;
