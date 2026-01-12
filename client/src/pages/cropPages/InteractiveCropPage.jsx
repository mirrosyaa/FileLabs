import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import styles from "../../CSS/Pages/imageCrop.module.css";

function InteractiveCropPage({ fadeIn, file, onCropComplete, onBack, onBackToUpload }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(null);
  const [aspectLocked, setAspectLocked] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState("free");

  const aspectRatios = [
    { value: "free", label: "Free", ratio: null },
    { value: "1:1", label: "1:1 (Square)", ratio: 1 },
    { value: "4:3", label: "4:3", ratio: 4/3 },
    { value: "16:9", label: "16:9", ratio: 16/9 },
    { value: "3:2", label: "3:2", ratio: 3/2 },
    { value: "21:9", label: "21:9", ratio: 21/9 }
  ];

  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAspectChange = (value, ratio, locked) => {
    setSelectedAspect(value);
    setAspect(ratio);
    setAspectLocked(locked);
  };

  const handleCrop = () => {
    onCropComplete(croppedAreaPixels);
  };

  const imageUrl = URL.createObjectURL(file);

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div className={styles.conversionBox}>
        <button className={styles.backLink} onClick={onBackToUpload}>
          ← Back to upload
        </button>

        <h2 className={styles.conversionTitle}>Crop Image</h2>
        
        <div className={styles.cropperContainer} style={{ height: '280px', marginBottom: '16px' }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectLocked ? aspect : undefined}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                position: 'relative',
                width: '100%',
                height: '280px',
                background: '#000',
                borderRadius: '12px',
                overflow: 'hidden'
              }
            }}
          />
        </div>

        <div className={styles.cropControls} style={{ marginBottom: '16px' }}>
          <div className={styles.controlGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
          </div>

          <div className={styles.formatOptions} style={{ marginBottom: '0' }}>
            <p className={styles.formatLabel}>Aspect Ratio</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '0' }}>
              {aspectRatios.map((ar) => (
                <button
                  key={ar.value}
                  className={`${styles.compactFormatOption} ${selectedAspect === ar.value ? styles.selectedFormat : ""}`}
                  onClick={() => handleAspectChange(ar.value, ar.ratio, ar.ratio !== null)}
                  style={{
                    padding: '10px 8px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    background: selectedAspect === ar.value ? 'rgba(94, 200, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: selectedAspect === ar.value ? '2px solid #5ec8ff' : '2px solid rgba(94, 200, 255, 0.3)',
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
        </div>

        {selectedAspect !== "free" && (
          <button className={styles.convertButton} onClick={handleCrop} style={{ marginTop: '20px' }}>
            Crop Image
          </button>
        )}
      </div>
    </div>
  );
}

export default InteractiveCropPage;
