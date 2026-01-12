import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import styles from "../CSS/Pages/imageCrop.module.css";

function ImageCrop() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = options, 4 = processing, 5 = complete
  const [files, setFiles] = useState([]);
  const [cropX, setCropX] = useState("");
  const [cropY, setCropY] = useState("");
  const [cropWidth, setCropWidth] = useState("");
  const [cropHeight, setCropHeight] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  // Simulate upload progress
  useEffect(() => {
    if (page === 2) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setFadeIn(false);
              setTimeout(() => {
                setPage(3);
                setFadeIn(true);
              }, 300);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [page]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFiles(imageFiles);
      setError(null);
      setFadeIn(false);
      setTimeout(() => {
        setPage(2);
        setFadeIn(true);
      }, 300);
    } else {
      setError("Please upload image files only");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setError(null);
      setFadeIn(false);
      setTimeout(() => {
        setPage(2);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleCrop = async () => {
    if (!cropWidth || !cropHeight) {
      setError("Please enter crop width and height");
      return;
    }

    setFadeIn(false);
    setTimeout(() => {
      setPage(4);
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);
      setFadeIn(true);

      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("operation", "crop");
      formData.append("x", cropX || "0");
      formData.append("y", cropY || "0");
      formData.append("width", cropWidth);
      formData.append("height", cropHeight);

      fetch("http://localhost:3001/api/image/crop", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Crop failed");
          }
          return response.blob();
        })
        .then((blob) => {
          clearInterval(progressInterval);
          setProcessingProgress(100);

          const url = window.URL.createObjectURL(blob);
          const filename = files.length === 1 
            ? `cropped_${files[0].name}` 
            : "cropped_images.zip";
          
          setDownloadUrl(url);
          setDownloadFilename(filename);

          setTimeout(() => {
            setIsProcessing(false);
            setFadeIn(false);
            setTimeout(() => {
              setPage(5);
              setFadeIn(true);
            }, 300);
          }, 500);
        })
        .catch((error) => {
          console.error("Crop error:", error);
          clearInterval(progressInterval);
          setError(error.message || "Failed to crop images");
          setIsProcessing(false);
          setFadeIn(false);
          setTimeout(() => {
            setPage(3);
            setFadeIn(true);
          }, 300);
        });
    }, 300);
  };

  const handleDownload = () => {
    if (downloadUrl && downloadFilename) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setHasDownloaded(true);
    }
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setCropX("");
      setCropY("");
      setCropWidth("");
      setCropHeight("");
      setUploadProgress(0);
      setIsProcessing(false);
      setProcessingProgress(0);
      setHasDownloaded(false);
      setDownloadUrl(null);
      setDownloadFilename("");
      setError(null);
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className={styles.imageCropPage}>
      <div className={styles.imageCropMain}>
        <div className={styles.imageCropContent}>
          <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
            <h1 className={styles.mainTitle}>Crop Images</h1>

            {page === 1 && (
              <div
                className={`${styles.uploadBox} ${isDragging ? styles.dragging : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={styles.uploadIcon}>✂️</div>
                <h2 className={styles.uploadTitle}>Upload Images</h2>
                <p className={styles.uploadText}>Drag and drop images here</p>
                <p className={styles.uploadSubtext}>or</p>
                <label className={styles.uploadButton}>
                  Choose Files
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                </label>
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>
            )}

            {page === 2 && (
              <div className={styles.uploadingContainer}>
                <div className={styles.uploadingBox}>
                  <div className={styles.spinner}></div>
                  <h2 className={styles.uploadingTitle}>Uploading...</h2>
                  <p className={styles.uploadingText}>{files.length} image(s)</p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{uploadProgress}%</p>
                </div>
              </div>
            )}

            {page === 3 && (
              <div className={styles.optionsContainer}>
                <div className={styles.optionsBox}>
                  <h2 className={styles.optionsTitle}>Crop Options</h2>
                  <p className={styles.fileCount}>{files.length} image(s) uploaded</p>
                  
                  <div className={styles.dimensionsGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>X Position (px)</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={cropX}
                        onChange={(e) => setCropX(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Y Position (px)</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={cropY}
                        onChange={(e) => setCropY(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Width (px)</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="Required"
                        value={cropWidth}
                        onChange={(e) => setCropWidth(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Height (px)</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="Required"
                        value={cropHeight}
                        onChange={(e) => setCropHeight(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className={styles.helpText}>
                    <p>💡 Tip: X and Y define the top-left corner of the crop area</p>
                  </div>

                  {error && <p className={styles.errorMessage}>{error}</p>}

                  <button className={styles.cropButton} onClick={handleCrop}>
                    Crop Images
                  </button>
                </div>
              </div>
            )}

            {page === 4 && (
              <div className={styles.processingContainer}>
                <div className={styles.processingBox}>
                  <div className={styles.spinner}></div>
                  <h2 className={styles.processingTitle}>Cropping...</h2>
                  <p className={styles.processingText}>Processing your images</p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{processingProgress}%</p>
                </div>
              </div>
            )}

            {page === 5 && (
              <div className={styles.completeContainer}>
                <div className={styles.completeBox}>
                  <div className={styles.checkmark}>✓</div>
                  <h2 className={styles.completeTitle}>Crop Complete!</h2>
                  <p className={styles.completeText}>Your images are ready</p>
                  <div className={styles.buttonGroup}>
                    <button className={`${styles.actionButton} ${styles.downloadBtn}`} onClick={handleDownload}>
                      {hasDownloaded ? "Download Again" : "Download Images"}
                    </button>
                    <button className={`${styles.actionButton} ${styles.resetBtn}`} onClick={handleReset}>
                      Crop More Images
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ImageCrop;
