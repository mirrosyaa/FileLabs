import React from "react";

function PreviewContainer({ 
  previewContainerRef,
  assetFrameRef,
  children
}) {
  return (
    <div style={{ flex: 1, minWidth: '500px' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        border: '2px solid rgba(94, 200, 255, 0.3)'
      }}>
        <h3 style={{
          color: '#5ec8ff',
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Preview
        </h3>

        <div 
          ref={previewContainerRef}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
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
