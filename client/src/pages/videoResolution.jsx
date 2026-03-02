import React, { useState, useRef } from "react";
import styles from "../CSS/Pages/compressor.module.css";
import Footer from "../components/Layout/footer";
import UploadPage from "./resolutionPages/UploadPage";
import UploadingPage from "./resolutionPages/UploadingPage";
import ResolutionPage from "./resolutionPages/ResolutionPage";
import ProcessingPage from "./resolutionPages/ProcessingPage";
import DownloadPage from "./resolutionPages/DownloadPage";

function VideoResolution() {
  const [page, setPage] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedResolution, setSelectedResolution] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [error, setError] = useState("");
  const [processedFiles, setProcessedFiles] = useState([]);
  const downloadTriggeredRef = useRef(false);

  const changePage = (newPage) => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(newPage);
      setFadeIn(true);
    }, 300);
  };

  // Drag and drop handlers
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
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles) => {
    if (selectedFiles.length === 0) return;

    // Check if files are video files
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
    const nonVideoFiles = selectedFiles.filter(file => 
      !videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (nonVideoFiles.length > 0) {
      const fileNames = nonVideoFiles.map(f => f.name).join(', ');
      setFadeIn(false);
      setTimeout(() => {
        setError(`Only video files are supported. Invalid files: ${fileNames}`);
        setFadeIn(true);
      }, 300);
      return;
    }

    setFiles(selectedFiles);
    setError("");
    
    // Fade out current page, then start upload
    setFadeIn(false);
    setTimeout(() => {
      setIsUploading(true);
      setUploadProgress(0);
      setFadeIn(true);
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Fade out uploading page before changing
            setFadeIn(false);
            setTimeout(() => {
              setIsUploading(false);
              setPage(2);
              setFadeIn(true);
            }, 300);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }, 300);
  };

  const handleProcess = async () => {
    if (isProcessing) return; // Prevent double processing
    
    if (!selectedResolution) {
      setError("Please select a resolution");
      return;
    }

    setError("");
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      formData.append("resolution", selectedResolution);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("http://localhost:3001/api/resolution/change", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Resolution change failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Generate filename
      const baseName = files.length === 1 
        ? files[0].name.replace(/\.[^/.]+$/, "") // Remove extension
        : "video";
      
      const extension = files[0].name.split('.').pop();
      
      setProcessedFiles([{ url, name: `${baseName}_${selectedResolution}.${extension}` }]);
      setProcessingProgress(100);
      
      // Fade out processing page before changing
      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setIsProcessing(false);
          setPage(3);
          setFadeIn(true);
        }, 300);
      }, 500);
    } catch (err) {
      console.error("Resolution processing error:", err);
      setError(err.message || "Failed to change video resolution");
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleDownload = () => {
    if (hasDownloaded || downloadTriggeredRef.current) {
      return; // Prevent double downloads
    }
    
    downloadTriggeredRef.current = true;
    setIsDownloading(true);
    
    // Simulate download progress with simple counter
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setDownloadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 100);
    
    // Trigger actual download after progress completes (1 second)
    setTimeout(() => {
      if (processedFiles.length > 0) {
        const file = processedFiles[0];
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(file.url);
          setIsDownloading(false);
          setHasDownloaded(true);
        }, 100);
      }
    }, 1100); // Wait for progress to complete (100ms * 10 + buffer)
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setSelectedResolution("");
      setProcessedFiles([]);
      setError("");
      setUploadProgress(0);
      setProcessingProgress(0);
      setDownloadProgress(0);
      setHasDownloaded(false);
      downloadTriggeredRef.current = false;
      setFadeIn(true);
    }, 300);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={styles.compressorPage}>
      <div className={styles.compressorMain}>
        <div className={styles.compressorContent}>
          {/* Page 1: Upload */}
          {page === 1 && !isUploading && (
            <UploadPage
              fadeIn={fadeIn}
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              error={error}
              onReset={handleReset}
            />
          )}

          {/* Uploading */}
          {isUploading && (
            <UploadingPage fadeIn={fadeIn} uploadProgress={uploadProgress} />
          )}

          {/* Page 2: Resolution Settings */}
          {page === 2 && !isProcessing && (
            <ResolutionPage
              fadeIn={fadeIn}
              files={files}
              selectedResolution={selectedResolution}
              setSelectedResolution={setSelectedResolution}
              error={error}
              onProcess={handleProcess}
              onReset={handleReset}
              formatFileSize={formatFileSize}
            />
          )}

          {/* Processing */}
          {isProcessing && (
            <ProcessingPage fadeIn={fadeIn} processingProgress={processingProgress} />
          )}

          {/* Page 3: Download */}
          {page === 3 && (
            <DownloadPage
              fadeIn={fadeIn}
              isDownloading={isDownloading}
              hasDownloaded={hasDownloaded}
              downloadProgress={downloadProgress}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default VideoResolution;
