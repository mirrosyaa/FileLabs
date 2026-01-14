import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import commonStyles from "../../CSS/Pages/CropPages/common.module.css";
import styles from "../../CSS/Pages/CropPages/interactive.module.css";
import "../../CSS/Pages/CropPages/cropper.module.css";

function InteractiveCropPage({
  fadeIn,
  file,
  currentIndex,
  totalFiles,
  onCropComplete,
  onSkip,
  onCancel,
}) {
  const cropperRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(NaN); // NaN = Free
  const [exportFormat, setExportFormat] = useState('image/png');

  // Load image when component mounts or file changes
  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result);
    });
    reader.readAsDataURL(file);
  }, [file]);

  const handleZoomChange = (e) => {
    const zoomValue = Number(e.target.value);
    setZoom(zoomValue);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.zoomTo(zoomValue / 50);
    }
  };

  const handleZoomIn = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.zoom(0.1);
      const newZoom = Math.min(zoom + 5, 100);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.zoom(-0.1);
      const newZoom = Math.max(zoom - 5, 0);
      setZoom(newZoom);
    }
  };

  const handleRotationChange = (e) => {
    const rotationValue = Number(e.target.value);
    setRotation(rotationValue);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.rotateTo(rotationValue);
    }
  };

  const handleRotate90 = (degrees) => {
    const newRotation = (rotation + degrees) % 360;
    setRotation(newRotation);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.rotate(degrees);
    }
  };

  const handleAspectChange = (ratio) => {
    setAspectRatio(ratio);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(ratio);
    }
  };

  const handleResetCrop = () => {
    setZoom(0);
    setRotation(0);
    setAspectRatio(NaN);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.reset();
      cropperRef.current.cropper.setAspectRatio(NaN);
    }
  };

  const handleApplyCrop = async () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      try {
        const cropper = cropperRef.current.cropper;
        
        // Get cropped canvas
        const croppedCanvas = cropper.getCroppedCanvas({
          maxWidth: 4096,
          maxHeight: 4096,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        if (!croppedCanvas) {
          console.error('Failed to get cropped canvas');
          return;
        }

        // Convert canvas to blob
        croppedCanvas.toBlob((blob) => {
          if (blob) {
            // Create a new file from the blob
            const croppedFile = new File([blob], file.name, {
              type: exportFormat,
              lastModified: Date.now(),
            });

            // Get crop data for backend
            const cropData = cropper.getData();
            
            onCropComplete({
              file: croppedFile,
              cropArea: {
                x: Math.round(cropData.x),
                y: Math.round(cropData.y),
                width: Math.round(cropData.width),
                height: Math.round(cropData.height),
              },
              zoom: zoom,
              rotation: rotation,
            });
          }
        }, exportFormat, exportFormat === 'image/jpeg' ? 0.95 : undefined);
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  return (
    <div className={`${commonStyles.pageContainer} ${fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut}`}>
      <div className={styles.cropContainer}>
        {/* Left side - 2/3 - Photo area */}
        <div className={styles.cropPhotoArea}>
          <div className={styles.cropHeader}>
            <h2 className={styles.cropTitle}>
              Crop Image {currentIndex + 1} of {totalFiles}
            </h2>
            <p className={styles.cropFilename}>{file.name}</p>
          </div>

          <div className={styles.cropperWrapper}>
            {imageSrc && (
              <Cropper
                ref={cropperRef}
                src={imageSrc}
                style={{ height: '100%', width: '100%' }}
                background={false}
                responsive={true}
                autoCropArea={0.8}
                aspectRatio={aspectRatio}
                viewMode={1}
                dragMode="move"
                guides={true}
                center={true}
                highlight={true}
                cropBoxMovable={true}
                cropBoxResizable={true}
                toggleDragModeOnDblclick={false}
                checkOrientation={true}
                zoomOnWheel={true}
                zoomOnTouch={true}
                wheelZoomRatio={0.1}
              />
            )}
          </div>
        </div>

        {/* Right side - 1/3 - Options panel */}
        <div className={styles.cropOptionsPanel}>
          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>Crop Settings</h3>

            {/* Aspect Ratio */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Aspect Ratio</label>
              <div className={styles.aspectButtons}>
                <button
                  className={`${styles.aspectBtn} ${isNaN(aspectRatio) ? styles.activeAspect : ''}`}
                  onClick={() => handleAspectChange(NaN)}
                  title="Free form - drag any corner"
                >
                  Free
                </button>
                <button
                  className={`${styles.aspectBtn} ${aspectRatio === 1 ? styles.activeAspect : ''}`}
                  onClick={() => handleAspectChange(1)}
                >
                  1:1
                </button>
                <button
                  className={`${styles.aspectBtn} ${aspectRatio === 4/5 ? styles.activeAspect : ''}`}
                  onClick={() => handleAspectChange(4/5)}
                >
                  4:5
                </button>
                <button
                  className={`${styles.aspectBtn} ${aspectRatio === 16/9 ? styles.activeAspect : ''}`}
                  onClick={() => handleAspectChange(16/9)}
                >
                  16:9
                </button>
              </div>
            </div>

            {/* Zoom */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                Zoom
              </label>
              <div className={styles.zoomControls}>
                <button className={styles.zoomBtn} onClick={handleZoomOut}>−</button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={zoom}
                  onChange={handleZoomChange}
                  className={styles.slider}
                />
                <button className={styles.zoomBtn} onClick={handleZoomIn}>+</button>
              </div>
            </div>

            {/* Rotation */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={handleRotationChange}
                className={styles.slider}
              />
              <div className={styles.rotationQuickBtns}>
                <button
                  className={styles.quickRotateBtn}
                  onClick={() => handleRotate90(90)}
                >
                  ↻ 90°
                </button>
                <button
                  className={styles.quickRotateBtn}
                  onClick={() => handleRotate90(-90)}
                >
                  ↺ 90°
                </button>
              </div>
            </div>

            {/* Export Format */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Export Format</label>
              <div className={styles.formatButtons}>
                <button
                  className={`${styles.formatBtn} ${exportFormat === 'image/png' ? styles.activeFormat : ''}`}
                  onClick={() => setExportFormat('image/png')}
                >
                  PNG
                </button>
                <button
                  className={`${styles.formatBtn} ${exportFormat === 'image/jpeg' ? styles.activeFormat : ''}`}
                  onClick={() => setExportFormat('image/jpeg')}
                >
                  JPEG
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button className={styles.resetCropBtn} onClick={handleResetCrop}>
              Reset Crop
            </button>
          </div>

          {/* Action Buttons */}
          <div className={styles.cropActions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              Cancel All
            </button>
            <button className={styles.skipBtn} onClick={onSkip}>
              Skip {currentIndex < totalFiles - 1 ? '& Next' : ''}
            </button>
            <button className={styles.applyCropBtn} onClick={handleApplyCrop}>
              {currentIndex < totalFiles - 1 ? 'Crop & Next' : 'Crop & Finish'}
            </button>
          </div>

          {/* Instructions */}
          <div className={styles.instructionsBox}>
            <p className={styles.instructionTitle}>💡 How to crop:</p>
            <ul className={styles.instructionsList}>
              <li>Drag image to reposition</li>
              <li>Drag corners/edges to resize crop area</li>
              <li>Use mouse wheel or slider to zoom</li>
              <li>Select aspect ratio or use "Free" mode</li>
              <li>Rotate with buttons or slider</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveCropPage;
