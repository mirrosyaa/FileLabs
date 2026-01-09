import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import UploadPage from "./converterPages/UploadPage";
import UploadingPage from "./converterPages/UploadingPage";
import ConversionPage from "./converterPages/ConversionPage";
import DownloadPage from "./converterPages/DownloadPage";
import { detectFileType } from "../utils/fileConverterHelpers";
import styles from "../CSS/fileConverter.module.css";

function FileConverter() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = conversion, 4 = complete
  const [files, setFiles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('');
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  // Detect file types from uploaded files
  const fileTypes = files.reduce((acc, file) => {
    const type = detectFileType(file);
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {});

  const primaryFileType = Object.keys(fileTypes)[0];
  const hasMixedTypes = Object.keys(fileTypes).length > 1;

  // Simulate upload progress
  useEffect(() => {
    if (page === 2) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
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
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setError(null);
      setFadeIn(false);
      setTimeout(() => {
        setPage(2);
        setFadeIn(true);
      }, 300);
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

  const handleConvert = async () => {
    if (!selectedFormat) {
      setError('Please select a target format');
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);
    setError(null);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setConversionProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Stop at 90% until actual conversion completes
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("operation", "convert");
    formData.append("format", selectedFormat);

    try {
      const response = await fetch("http://localhost:3001/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Conversion failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "converted-file";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(filename);
      
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      // Switch to download page immediately
      setIsConverting(false);
      setPage(4);
      setFadeIn(true);
    } catch (err) {
      clearInterval(progressInterval);
      setConversionProgress(0);
      setError(err.message || "An error occurred during conversion");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress for better UX
    const progressInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    try {
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      // Reset after download
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setHasDownloaded(true);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      setIsDownloading(false);
      setDownloadProgress(0);
      setError("Download failed. Please try again.");
    }
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setSelectedFormat('');
      setDownloadUrl(null);
      setDownloadFilename('');
      setHasDownloaded(false);
      setError(null);
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className={styles.converterPage}>      
      <main className={styles.converterMain}>
        <div className={styles.converterContent}>
          
          {/* PAGE 1: Upload */}
          {page === 1 && (
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

          {/* PAGE 2: Uploading */}
          {page === 2 && (
            <UploadingPage
              fadeIn={fadeIn}
              uploadProgress={uploadProgress}
            />
          )}

          {/* PAGE 3: Choose Conversion */}
          {page === 3 && (
            <ConversionPage
              fadeIn={fadeIn}
              isConverting={isConverting}
              conversionProgress={conversionProgress}
              hasMixedTypes={hasMixedTypes}
              primaryFileType={primaryFileType}
              files={files}
              fileTypes={fileTypes}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              handleConvert={handleConvert}
              handleReset={handleReset}
              error={error}
            />
          )}

          {/* PAGE 4: Download */}
          {page === 4 && (
            <DownloadPage
              fadeIn={fadeIn}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              hasDownloaded={hasDownloaded}
              downloadFilename={downloadFilename}
              selectedFormat={selectedFormat}
              handleDownload={handleDownload}
              handleReset={handleReset}
            />
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FileConverter;
