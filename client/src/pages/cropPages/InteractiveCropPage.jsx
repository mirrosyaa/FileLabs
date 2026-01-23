import React, { useState, useRef, useEffect, useMemo } from "react";
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
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(NaN); // NaN = Free
  const [exportFormat, setExportFormat] = useState("image/png");

  // Custom aspect ratio states
  const [isCustomAspect, setIsCustomAspect] = useState(false);
  const [customAspectWidth, setCustomAspectWidth] = useState(16);
  const [customAspectHeight, setCustomAspectHeight] = useState(9);

  // New states for custom dimensions
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  const aspectRatioLocked = true;
  const [upscaleError, setUpscaleError] = useState(false);

  // Resize states
  const [resizeMethod, setResizeMethod] = useState('none'); // 'none', 'preset', 'custom', 'percentage'
  const [resizePreset, setResizePreset] = useState('');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [resizePercentage, setResizePercentage] = useState(100);

  const resizePresets = useMemo(() => [
    { label: 'Instagram Square', width: 1080, height: 1080 },
    { label: 'Instagram Portrait', width: 1080, height: 1350 },
    { label: 'Instagram Landscape', width: 1080, height: 566 },
    { label: 'Facebook Post', width: 1200, height: 630 },
    { label: 'Twitter Post', width: 1200, height: 675 },
    { label: 'YouTube Thumbnail', width: 1280, height: 720 },
    { label: 'Full HD', width: 1920, height: 1080 },
    { label: '4K', width: 3840, height: 2160 },
  ], []);

  // Load image when component mounts or file changes
  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageUrl = reader.result;
      setImageSrc(imageUrl);

      // Create an image element to get natural dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.naturalWidth);
        setOriginalHeight(img.naturalHeight);
        setCustomWidth(img.naturalWidth);
        setCustomHeight(img.naturalHeight);
      };
      img.src = imageUrl;
    });
    reader.readAsDataURL(file);
  }, [file]);

  // Handle resize preset changes to show live preview
  useEffect(() => {
    if (resizeMethod === 'preset' && resizePreset && cropperRef.current && cropperRef.current.cropper) {
      const selectedPreset = resizePresets.find(p => p.label === resizePreset);
      if (selectedPreset) {
        // Update the crop dimensions to match the preset aspect ratio
        const presetRatio = selectedPreset.width / selectedPreset.height;
        cropperRef.current.cropper.setAspectRatio(presetRatio);
        setAspectRatio(presetRatio);
        setIsCustomAspect(false);
      }
    }
  }, [resizeMethod, resizePreset, resizePresets]);

  // Handle custom resize dimensions for live preview
  useEffect(() => {
    if (resizeMethod === 'custom' && (resizeWidth || resizeHeight) && cropperRef.current && cropperRef.current.cropper) {
      const width = parseInt(resizeWidth) || 0;
      const height = parseInt(resizeHeight) || 0;
      
      if (width > 0 && height > 0) {
        const customRatio = width / height;
        cropperRef.current.cropper.setAspectRatio(customRatio);
        setAspectRatio(customRatio);
        setIsCustomAspect(false);
      } else if (width > 0 || height > 0) {
        // If only one dimension is set, use free aspect ratio
        cropperRef.current.cropper.setAspectRatio(NaN);
        setAspectRatio(NaN);
        setIsCustomAspect(false);
      }
    }
  }, [resizeMethod, resizeWidth, resizeHeight]);

  // Handle percentage resize for live preview
  useEffect(() => {
    if (resizeMethod === 'percentage' && cropperRef.current && cropperRef.current.cropper) {
      // For percentage scaling, maintain the original aspect ratio
      if (originalWidth > 0 && originalHeight > 0) {
        const originalRatio = originalWidth / originalHeight;
        cropperRef.current.cropper.setAspectRatio(originalRatio);
        setAspectRatio(originalRatio);
        setIsCustomAspect(false);
      }
    }
  }, [resizeMethod, resizePercentage, originalWidth, originalHeight]);

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
    setIsCustomAspect(false);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(ratio);
    }
  };

  const handleCustomAspectChange = () => {
    setIsCustomAspect(true);
    const ratio = customAspectWidth / customAspectHeight;
    setAspectRatio(ratio);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(ratio);
    }
  };

  const handleCustomAspectWidthChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setCustomAspectWidth(value);
    if (isCustomAspect) {
      const ratio = value / customAspectHeight;
      setAspectRatio(ratio);
      if (cropperRef.current && cropperRef.current.cropper) {
        cropperRef.current.cropper.setAspectRatio(ratio);
      }
    }
  };

  const handleCustomAspectHeightChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setCustomAspectHeight(value);
    if (isCustomAspect) {
      const ratio = customAspectWidth / value;
      setAspectRatio(ratio);
      if (cropperRef.current && cropperRef.current.cropper) {
        cropperRef.current.cropper.setAspectRatio(ratio);
      }
    }
  };

  const handleResetCrop = () => {
    setRotation(0);
    setAspectRatio(NaN);
    setIsCustomAspect(false);
    setCustomAspectWidth(16);
    setCustomAspectHeight(9);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.reset();
      cropperRef.current.cropper.setAspectRatio(NaN);
    }
  };

  // Custom dimension handlers
  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value) || 0;

    // Prevent upscaling - clamp to original width
    if (newWidth > originalWidth) {
      setUpscaleError(true);
      setCustomWidth(originalWidth);
      return;
    }

    setUpscaleError(false);
    setCustomWidth(newWidth);

    // If aspect ratio is locked, calculate and update height
    if (aspectRatioLocked && originalWidth > 0 && originalHeight > 0) {
      const ratio = originalHeight / originalWidth;
      const newHeight = Math.round(newWidth * ratio);
      setCustomHeight(newHeight);
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value) || 0;

    // Prevent upscaling - clamp to original height
    if (newHeight > originalHeight) {
      setUpscaleError(true);
      setCustomHeight(originalHeight);
      return;
    }

    setUpscaleError(false);
    setCustomHeight(newHeight);

    // If aspect ratio is locked, calculate and update width
    if (aspectRatioLocked && originalWidth > 0 && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      const newWidth = Math.round(newHeight * ratio);
      setCustomWidth(newWidth);
    }
  };

  // Apply crop/resize and proceed
  const handleApplyCrop = () => {
    if (cropperRef.current?.cropper) {
      try {
        const cropper = cropperRef.current.cropper;

        // Get cropped canvas with custom dimensions
        const croppedCanvas = cropper.getCroppedCanvas({
          width: customWidth,
          height: customHeight,
          maxWidth: originalWidth,
          maxHeight: originalHeight,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        });

        if (!croppedCanvas) {
          console.error("Failed to get cropped canvas");
          return;
        }

        // Convert canvas to blob
        croppedCanvas.toBlob(
          (blob) => {
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
                rotation: rotation,
              });
            }
          },
          exportFormat,
          exportFormat === "image/jpeg" ? 0.95 : undefined
        );
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    }
  };

  return (
    <div
      className={`${commonStyles.pageContainer} ${
        fadeIn ? commonStyles.fadeIn : commonStyles.fadeOut
      }`}
    >
      <div className={styles.cropContainer}>
        {/* Left side - 2/3 - Photo area */}
        <div className={styles.cropPhotoArea}>
          <div className={styles.cropperWrapper}>
            {imageSrc && (
              <Cropper
                ref={cropperRef}
                src={imageSrc}
                style={{ height: "100%", width: "100%" }}
                background={false}
                responsive={true}
                autoCropArea={0.8}
                aspectRatio={aspectRatio}
                viewMode={1}
                dragMode="crop"
                guides={true}
                center={true}
                highlight={true}
                cropBoxMovable={true}
                cropBoxResizable={true}
                toggleDragModeOnDblclick={false}
                checkOrientation={true}
                zoomable={true}
                zoomOnWheel={true}
                zoomOnTouch={false}
                wheelZoomRatio={0.1}
                scalable={false}
              />
            )}
          </div>
        </div>

        {/* Right side - 1/3 - Options panel */}
        <div className={styles.cropOptionsPanel}>
          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>Image Settings</h3>

            {/* Aspect Ratio */}
            <div className={`${styles.optionGroup} ${styles.hoverable}`}>
              <label className={styles.optionLabel}>Aspect Ratio</label>
              <div className={styles.optionContent}>
                <div className={styles.aspectButtons}>
                  <button
                    className={`${styles.aspectBtn} ${
                      isNaN(aspectRatio) && !isCustomAspect
                        ? styles.activeAspect
                        : ""
                    }`}
                    onClick={() => handleAspectChange(NaN)}
                    title="Free form - drag any corner"
                  >
                    Free
                  </button>
                  <button
                    className={`${styles.aspectBtn} ${
                      aspectRatio === 1 && !isCustomAspect
                        ? styles.activeAspect
                        : ""
                    }`}
                    onClick={() => handleAspectChange(1)}
                  >
                    1:1
                  </button>
                  <button
                    className={`${styles.aspectBtn} ${
                      aspectRatio === 16 / 9 && !isCustomAspect
                        ? styles.activeAspect
                        : ""
                    }`}
                    onClick={() => handleAspectChange(16 / 9)}
                  >
                    16:9
                  </button>
                  <button
                    className={`${styles.aspectBtn} ${
                      isCustomAspect ? styles.activeAspect : ""
                    }`}
                    onClick={handleCustomAspectChange}
                  >
                    Custom
                  </button>
                </div>

                {isCustomAspect && (
                  <div className={styles.customAspectInputs}>
                    <div className={styles.dimensionInputsGrid}>
                      <div className={styles.dimensionInputWrapper}>
                        <label
                          className={styles.optionLabel}
                          style={{ fontSize: "14px" }}
                        >
                          Width
                        </label>
                        <input
                          type="number"
                          className={styles.dimensionInput}
                          value={customAspectWidth}
                          onChange={handleCustomAspectWidthChange}
                          min={1}
                          placeholder="Width"
                        />
                      </div>
                      <div className={styles.dimensionInputWrapper}>
                        <label
                          className={styles.optionLabel}
                          style={{ fontSize: "14px" }}
                        >
                          Height
                        </label>
                        <input
                          type="number"
                          className={styles.dimensionInput}
                          value={customAspectHeight}
                          onChange={handleCustomAspectHeightChange}
                          min={1}
                          placeholder="Height"
                        />
                      </div>
                    </div>
                    <p className={styles.aspectRatioInfo}>
                      Ratio: {customAspectWidth}:{customAspectHeight} (
                      {(customAspectWidth / customAspectHeight).toFixed(2)})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Dimensions */}
            <div className={`${styles.optionGroup} ${styles.hoverable}`}>
              <label className={styles.optionLabel}>Dimensions</label>
              <div className={styles.optionContent}>
                <div className={styles.dimensionInputsGrid}>
                  <div className={styles.dimensionInputWrapper}>
                    <label
                      className={styles.optionLabel}
                      style={{ fontSize: "14px" }}
                    >
                      Width
                    </label>
                    <div className={styles.inputWithUnit}>
                      <input
                        type="number"
                        className={styles.dimensionInput}
                        value={customWidth}
                        onChange={handleWidthChange}
                        min={1}
                        max={originalWidth}
                        placeholder="Width"
                      />
                      <span className={styles.unitLabel}>px</span>
                    </div>
                  </div>
                  <div className={styles.dimensionInputWrapper}>
                    <label
                      className={styles.optionLabel}
                      style={{ fontSize: "14px" }}
                    >
                      Height
                    </label>
                    <div className={styles.inputWithUnit}>
                      <input
                        type="number"
                        className={styles.dimensionInput}
                        value={customHeight}
                        onChange={handleHeightChange}
                        min={1}
                        max={originalHeight}
                        placeholder="Height"
                      />
                      <span className={styles.unitLabel}>px</span>
                    </div>
                  </div>
                </div>

                {upscaleError && (
                  <div className={styles.errorMessage}>
                    You cannot make the image larger than it is.
                  </div>
                )}
              </div>
            </div>

            {/* Rotation */}
            <div className={`${styles.optionGroup} ${styles.hoverable}`}>
              <label className={styles.optionLabel}>
                Rotation: {rotation}°
              </label>
              <div className={styles.optionContent}>
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
            </div>

            {/* Resize Output */}
            <div className={`${styles.optionGroup} ${styles.hoverable}`}>
              <label className={styles.optionLabel}>Resize Output</label>
              <div className={styles.optionContent}>
                <div className={styles.resizeOptions}>
                    <div className={styles.resizeMethodButtons}>
                      <button
                        className={`${styles.resizeMethodBtn} ${
                          resizeMethod === 'preset' ? styles.activeResizeMethod : ''
                        }`}
                        onClick={() => setResizeMethod('preset')}
                      >
                        Preset
                      </button>
                      <button
                        className={`${styles.resizeMethodBtn} ${
                          resizeMethod === 'custom' ? styles.activeResizeMethod : ''
                        }`}
                        onClick={() => setResizeMethod('custom')}
                      >
                        Custom
                      </button>
                      <button
                        className={`${styles.resizeMethodBtn} ${
                          resizeMethod === 'percentage' ? styles.activeResizeMethod : ''
                        }`}
                        onClick={() => setResizeMethod('percentage')}
                      >
                        Scale
                      </button>
                    </div>

                    {resizeMethod === 'preset' && (
                      <select
                        className={styles.resizeSelect}
                        value={resizePreset}
                        onChange={(e) => setResizePreset(e.target.value)}
                      >
                        <option value="">Choose preset size...</option>
                        {resizePresets.map((preset) => (
                          <option key={preset.label} value={preset.label}>
                            {preset.label} ({preset.width} × {preset.height})
                          </option>
                        ))}
                      </select>
                    )}

                    {resizeMethod === 'custom' && (
                      <div className={styles.resizeCustomInputs}>
                        <div className={styles.dimensionInputWrapper}>
                          <label
                            className={styles.optionLabel}
                            style={{ fontSize: "14px" }}
                          >
                            Width
                          </label>
                          <div className={styles.inputWithUnit}>
                            <input
                              type="number"
                              className={styles.dimensionInput}
                              placeholder="Auto"
                              value={resizeWidth}
                              onChange={(e) => setResizeWidth(e.target.value)}
                              min="1"
                            />
                            <span className={styles.unitLabel}>px</span>
                          </div>
                        </div>
                        <div className={styles.dimensionInputWrapper}>
                          <label
                            className={styles.optionLabel}
                            style={{ fontSize: "14px" }}
                          >
                            Height
                          </label>
                          <div className={styles.inputWithUnit}>
                            <input
                              type="number"
                              className={styles.dimensionInput}
                              placeholder="Auto"
                              value={resizeHeight}
                              onChange={(e) => setResizeHeight(e.target.value)}
                              min="1"
                            />
                            <span className={styles.unitLabel}>px</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {resizeMethod === 'percentage' && (
                      <div className={styles.resizePercentageWrapper}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                          Scale: {resizePercentage}%
                        </label>
                        <input
                          type="range"
                          className={styles.slider}
                          min="10"
                          max="200"
                          step="5"
                          value={resizePercentage}
                          onChange={(e) => setResizePercentage(Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* Export Format */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Export Format</label>
              <div className={styles.formatButtons}>
                <button
                  className={`${styles.formatBtn} ${
                    exportFormat === "image/png" ? styles.activeFormat : ""
                  }`}
                  onClick={() => setExportFormat("image/png")}
                >
                  PNG
                </button>
                <button
                  className={`${styles.formatBtn} ${
                    exportFormat === "image/jpeg" ? styles.activeFormat : ""
                  }`}
                  onClick={() => setExportFormat("image/jpeg")}
                >
                  JPEG
                </button>
                <button
                  className={`${styles.formatBtn} ${
                    exportFormat === "image/webp" ? styles.activeFormat : ""
                  }`}
                  onClick={() => setExportFormat("image/webp")}
                >
                  WEBP
                </button>
                <button
                  className={`${styles.formatBtn} ${
                    exportFormat === "image/bmp" ? styles.activeFormat : ""
                  }`}
                  onClick={() => setExportFormat("image/bmp")}
                >
                  BMP
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button className={styles.resetCropBtn} onClick={handleResetCrop}>
              Reset
            </button>
          </div>

          {/* Action Buttons */}
          <div className={styles.cropActions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              Back
            </button>
            <button
              className={styles.applyCropBtn}
              onClick={handleApplyCrop}
              disabled={
                upscaleError ||
                customWidth > originalWidth ||
                customHeight > originalHeight
              }
            >
              {currentIndex < totalFiles - 1 ? "Apply & Next" : "Apply & Finish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveCropPage;
