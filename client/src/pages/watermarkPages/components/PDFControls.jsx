import React from "react";
import styles from "../../../CSS/Pages/fileConverter.module.css";

function PDFControls({ 
  pdfPages, 
  setPdfPages, 
  pdfPageRange, 
  setPdfPageRange, 
  tiledMode, 
  setTiledMode,
  currentPdfPage,
  setCurrentPdfPage,
  totalPdfPages
}) {
  return (
    <>
      {totalPdfPages > 0 && (
        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(94, 200, 255, 0.1)', borderRadius: '8px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', display: 'block', marginBottom: '8px' }}>
            Preview Page: {currentPdfPage} / {totalPdfPages}
          </label>
          <input
            type="range"
            min="1"
            max={totalPdfPages}
            value={currentPdfPage}
            onChange={(e) => setCurrentPdfPage(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      )}

      <div className={styles.formatOptions}>
        <label className={styles.formatLabel}>Apply to Pages</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            className={`${styles.formatOption} ${pdfPages === "all" ? styles.selectedFormat : ""}`}
            onClick={() => setPdfPages("all")}
            style={{ flex: 1, padding: '10px', fontSize: '13px' }}
          >
            All
          </button>
          <button
            className={`${styles.formatOption} ${pdfPages === "first" ? styles.selectedFormat : ""}`}
            onClick={() => setPdfPages("first")}
            style={{ flex: 1, padding: '10px', fontSize: '13px' }}
          >
            First
          </button>
          <button
            className={`${styles.formatOption} ${pdfPages === "range" ? styles.selectedFormat : ""}`}
            onClick={() => setPdfPages("range")}
            style={{ flex: 1, padding: '10px', fontSize: '13px' }}
          >
            Range
          </button>
        </div>
        {pdfPages === "range" && (
          <input
            type="text"
            value={pdfPageRange}
            onChange={(e) => setPdfPageRange(e.target.value)}
            placeholder="e.g., 1-5, 7, 10-12"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(94, 200, 255, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={tiledMode}
            onChange={(e) => setTiledMode(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label className={styles.formatLabel} style={{ fontSize: '14px', margin: 0 }}>
            Tiled/Repeat Mode
          </label>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '6px', marginLeft: '30px' }}>
          Repeat watermark across the page
        </p>
      </div>
    </>
  );
}

export default PDFControls;
