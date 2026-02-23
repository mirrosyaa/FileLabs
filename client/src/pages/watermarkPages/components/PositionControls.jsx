import React from "react";
import styles from "../../../CSS/Pages/fileConverter.module.css";

function PositionControls({ 
  anchorPosition, 
  setAnchorPosition, 
  offsetX, 
  setOffsetX, 
  offsetY, 
  setOffsetY 
}) {
  const anchorPositions = [
    { value: "top-left", label: "TL", icon: "↖" },
    { value: "top-center", label: "TC", icon: "↑" },
    { value: "top-right", label: "TR", icon: "↗" },
    { value: "middle-left", label: "ML", icon: "←" },
    { value: "center", label: "C", icon: "⊙" },
    { value: "middle-right", label: "MR", icon: "→" },
    { value: "bottom-left", label: "BL", icon: "↙" },
    { value: "bottom-center", label: "BC", icon: "↓" },
    { value: "bottom-right", label: "BR", icon: "↘" }
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
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            <span style={{ fontSize: '20px' }}>{pos.icon}</span>
            <span>{pos.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '6px' }}>
            Offset X: {offsetX}px
          </label>
          <input
            type="number"
            value={offsetX}
            onChange={(e) => setOffsetX(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(94, 200, 255, 0.3)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '6px' }}>
            Offset Y: {offsetY}px
          </label>
          <input
            type="number"
            value={offsetY}
            onChange={(e) => setOffsetY(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(94, 200, 255, 0.3)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PositionControls;
