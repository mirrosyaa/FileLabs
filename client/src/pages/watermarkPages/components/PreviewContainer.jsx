import React from "react";

function PreviewContainer({ 
  previewContainerRef,
  assetFrameRef,
  children,
  zoomLevel,
  setZoomLevel,
  viewMode,
  setViewMode
}) {
  return (
    <div style={{ flex: 1, minWidth: '500px' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        border: '2px solid rgba(94, 200, 255, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{
            color: '#5ec8ff',
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            Preview
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('fit-width')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'fit-width' ? 'rgba(94, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: `2px solid ${viewMode === 'fit-width' ? '#5ec8ff' : 'rgba(94, 200, 255, 0.2)'}`,
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Fit Width
            </button>
            <button
              onClick={() => setViewMode('fit-height')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'fit-height' ? 'rgba(94, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: `2px solid ${viewMode === 'fit-height' ? '#5ec8ff' : 'rgba(94, 200, 255, 0.2)'}`,
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Fit Height
            </button>
            <button
              onClick={() => setViewMode('actual-size')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'actual-size' ? 'rgba(94, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: `2px solid ${viewMode === 'actual-size' ? '#5ec8ff' : 'rgba(94, 200, 255, 0.2)'}`,
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              100%
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>Zoom:</span>
          <input
            type="range"
            min="25"
            max="200"
            step="25"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            style={{
              flex: 1,
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '13px', color: '#5ec8ff', minWidth: '45px' }}>{zoomLevel}%</span>
        </div>

        <div 
          ref={previewContainerRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '500px',
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'auto',
            background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23333\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23333\'/%3E%3Crect x=\'10\' width=\'10\' height=\'10\' fill=\'%23444\'/%3E%3Crect y=\'10\' width=\'10\' height=\'10\' fill=\'%23444\'/%3E%3C/svg%3E")',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative'
          }}
        >
          <div ref={assetFrameRef} style={{ position: 'relative', display: 'inline-block' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewContainer;
