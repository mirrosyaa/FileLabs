import React, { useState } from "react";
import styles from "../CSS/Pages/compressor.module.css";
import Footer from "../components/Layout/footer";
import UploadPage from "./compressorPages/UploadPage";
import UploadingPage from "./compressorPages/UploadingPage";
import CompressionPage from "./compressorPages/CompressionPage";
import CompressingPage from "./compressorPages/CompressingPage";
import DownloadPage from "./compressorPages/DownloadPage";

function Compressor() {
  const [page, setPage] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [error, setError] = useState("");
  const [compressedFiles, setCompressedFiles] = useState([]);

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

  const handleCompress = async () => {
    setError("");
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("compressionLevel", compressionLevel);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setCompressionProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("http://localhost:3001/api/compress", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Compression failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setCompressedFiles([{ url, name: files.length > 1 ? "compressed.zip" : `compressed_${files[0].name}` }]);
      setCompressionProgress(100);
      
      // Fade out compressing page before changing
      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setIsCompressing(false);
          setPage(3);
          setFadeIn(true);
        }, 300);
      }, 500);
    } catch (err) {
      console.error("Compression error:", err);
      setError(err.message || "Failed to compress files");
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Trigger download
          compressedFiles.forEach(file => {
            const link = document.createElement("a");
            link.href = file.url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });

          setIsDownloading(false);
          setHasDownloaded(true);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setCompressionLevel("medium");
      setCompressedFiles([]);
      setError("");
      setUploadProgress(0);
      setCompressionProgress(0);
      setDownloadProgress(0);
      setHasDownloaded(false);
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
            />
          )}

          {/* Uploading */}
          {isUploading && (
            <UploadingPage fadeIn={fadeIn} uploadProgress={uploadProgress} />
          )}

          {/* Page 2: Compression Settings */}
          {page === 2 && !isCompressing && (
            <CompressionPage
              fadeIn={fadeIn}
              files={files}
              compressionLevel={compressionLevel}
              setCompressionLevel={setCompressionLevel}
              error={error}
              onCompress={handleCompress}
              onReset={handleReset}
              formatFileSize={formatFileSize}
            />
          )}

          {/* Compressing */}
          {isCompressing && (
            <CompressingPage fadeIn={fadeIn} compressionProgress={compressionProgress} />
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

export default Compressor;
