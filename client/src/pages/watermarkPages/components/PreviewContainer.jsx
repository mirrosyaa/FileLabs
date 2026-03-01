import React from "react";

function PreviewContainer({ 
  previewContainerRef,
  assetFrameRef,
  children
}) {
  return (
    <div style={{ flex: 1, minWidth: '500px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px',
        border: '2px solid rgba(94, 200, 255, 0.3)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <h3 style={{
          color: '#5ec8ff',
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          flexShrink: 0,
          margin: 0,
          paddingBottom: '12px'
        }}>
          Preview
        </h3>

        <div 
          ref={previewContainerRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            overflow: 'hidden',
            background: 'transparent',
            borderRadius: '12px',
            padding: '0',
            position: 'relative',
            minHeight: 0
          }}
        >
          <div ref={assetFrameRef} style={{ position: 'relative', display: 'flex', maxWidth: '100%', maxHeight: 'calc(100% - 40px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewContainer;
