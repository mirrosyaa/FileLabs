import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import UploadPage from "./pdfMergePages/UploadPage";
import UploadingPage from "./pdfMergePages/UploadingPage";
import ProcessingPage from "./pdfMergePages/ProcessingPage";
import SplitOptionsPage from "./pdfMergePages/SplitOptionsPage";
import DownloadPage from "./pdfMergePages/DownloadPage";
import styles from "../CSS/Pages/fileConverter.module.css";

function PdfMergeSplit() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = processing, 4 = split options, 5 = complete
  const [files, setFiles] = useState([]);
  const [selectedOperation, setSelectedOperation] = useState(""); // "merge" or "split"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
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
    const pdfFiles = droppedFiles.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      setError("Please upload PDF files only");
      return;
    }

    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      setError(null);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      setError("Please upload PDF files only");
      return;
    }

    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      setError(null);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleContinue = () => {
    if (files.length === 0) {
      setError("Please add at least one PDF file");
      return;
    }
    setFadeIn(false);
    setTimeout(() => {
      setPage(2);
      setFadeIn(true);
    }, 300);
  };

  const handleProcess = async () => {
    if (!selectedOperation) {
      setError("Please select an operation");
      return;
    }

    // If split is selected, go to split options page
    if (selectedOperation === "split") {
      setFadeIn(false);
      setTimeout(() => {
        setPage(4); // Split options page
        setFadeIn(true);
      }, 300);
      return;
    }

    // For merge operation, proceed with processing
    setFadeIn(false);

    setTimeout(() => {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);
      setFadeIn(true);
      const startTime = Date.now();
      const minLoadingTime = 1000;

      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          const newProgress = prev >= 90 ? 90 : prev + 10;
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("operation", selectedOperation);

      const performProcessing = async () => {
        try {
          const response = await fetch("http://localhost:3001/api/pdf/process", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || "Processing failed");
          }

          const blob = await response.blob();
          const contentDisposition = response.headers.get("content-disposition");
          let filename = selectedOperation === "merge" ? "merged.pdf" : "split.pdf";

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "");
            }
          }

          const url = window.URL.createObjectURL(blob);
          setDownloadUrl(url);
          setDownloadFilename(filename);

          clearInterval(progressInterval);
          setProcessingProgress(100);

          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

          setTimeout(() => {
            setFadeIn(false);
            setTimeout(() => {
              setIsProcessing(false);
              setPage(5);
              setFadeIn(true);
            }, 300);
          }, remainingTime + 500);
        } catch (err) {
          clearInterval(progressInterval);
          setProcessingProgress(0);
          setError(err.message || "An error occurred during processing");
          setIsProcessing(false);
          setFadeIn(true);
        }
      };

      performProcessing();
    }, 300);
  };

  const handleBackToOperations = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(3);
      setFadeIn(true);
    }, 300);
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    setIsDownloading(true);
    setDownloadProgress(0);

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
      await new Promise((resolve) => setTimeout(resolve, 600));

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      clearInterval(progressInterval);
      setDownloadProgress(100);

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
      setSelectedOperation("");
      setDownloadUrl(null);
      setDownloadFilename("");
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
              files={files}
              onRemoveFile={handleRemoveFile}
              onContinue={handleContinue}
              error={error}
            />
          )}

          {/* PAGE 2: Uploading */}
          {page === 2 && (
            <UploadingPage fadeIn={fadeIn} uploadProgress={uploadProgress} />
          )}

          {/* PAGE 3: Processing Options */}
          {page === 3 && (
            <ProcessingPage
              fadeIn={fadeIn}
              isProcessing={isProcessing}
              processingProgress={processingProgress}
              files={files}
              selectedOperation={selectedOperation}
              setSelectedOperation={setSelectedOperation}
              handleProcess={handleProcess}
              handleReset={handleReset}
              error={error}
            />
          )}

          {/* PAGE 4: Split Options */}
          {page === 4 && (
            <SplitOptionsPage
              fadeIn={fadeIn}
              files={files}
              handleBack={handleBackToOperations}
              setPage={setPage}
              setDownloadUrl={setDownloadUrl}
              setDownloadFilename={setDownloadFilename}
              setFadeIn={setFadeIn}
            />
          )}

          {/* PAGE 5: Download */}
          {page === 5 && (
            <DownloadPage
              fadeIn={fadeIn}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              hasDownloaded={hasDownloaded}
              downloadFilename={downloadFilename}
              selectedOperation={selectedOperation}
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

export default PdfMergeSplit;
