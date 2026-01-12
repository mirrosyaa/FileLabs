import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import styles from "../CSS/Pages/imageResize.module.css";

function ImageResize() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = options, 4 = processing, 5 = complete
  const [files, setFiles] = useState([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
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

  const handleResize = async () => {
    if (!width && !height) {
      setError("Please enter at least width or height");
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
      formData.append("operation", "resize");
      formData.append("width", width || "");
      formData.append("height", height || "");
      formData.append("maintainAspectRatio", maintainAspectRatio);

      fetch("http://localhost:3001/api/image/resize", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Resize failed");
          }
          return response.blob();
        })
        .then((blob) => {
          clearInterval(progressInterval);
          setProcessingProgress(100);

          const url = window.URL.createObjectURL(blob);
          const filename = files.length === 1 
            ? `resized_${files[0].name}` 
            : "resized_images.zip";
          
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
          console.error("Resize error:", error);
          clearInterval(progressInterval);
          setError(error.message || "Failed to resize images");
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
      setWidth("");
      setHeight("");
      setMaintainAspectRatio(true);
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
    <div className={styles.imageResizePage}>
      <div className={styles.imageResizeMain}>
        <div className={styles.imageResizeContent}>
          <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
            <h1 className={styles.mainTitle}>Resize Images</h1>

            {page === 1 && (
              <div
                className={`${styles.uploadBox} ${isDragging ? styles.dragging : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={styles.uploadIcon}>📁</div>
                <p className={styles.uploadText}>Drag & drop files here</p>
                <label className={styles.browseBtn}>
                  Browse Files
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
                  <h2 className={styles.optionsTitle}>Resize Options</h2>
                  <p className={styles.fileCount}>{files.length} image(s) uploaded</p>
                  
                  <div className={styles.dimensionsGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Width (px)</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="Auto"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Height (px)</label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="Auto"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>Maintain aspect ratio</span>
                    </label>
                  </div>

                  {error && <p className={styles.errorMessage}>{error}</p>}

                  <button className={styles.resizeButton} onClick={handleResize}>
                    Resize Images
                  </button>
                </div>
              </div>
            )}

            {page === 4 && (
              <div className={styles.processingContainer}>
                <div className={styles.processingBox}>
                  <div className={styles.spinner}></div>
                  <h2 className={styles.processingTitle}>Resizing...</h2>
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
                  <h2 className={styles.completeTitle}>Resize Complete!</h2>
                  <p className={styles.completeText}>Your images are ready</p>
                  <div className={styles.buttonGroup}>
                    <button className={`${styles.actionButton} ${styles.downloadBtn}`} onClick={handleDownload}>
                      {hasDownloaded ? "Download Again" : "Download Images"}
                    </button>
                    <button className={`${styles.actionButton} ${styles.resetBtn}`} onClick={handleReset}>
                      Resize More Images
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

export default ImageResize;
