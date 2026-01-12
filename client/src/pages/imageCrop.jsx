import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import UploadPage from "./cropPages/UploadPage";
import UploadingPage from "./cropPages/UploadingPage";
import InteractiveCropPage from "./cropPages/InteractiveCropPage";
import ProcessingPage from "./cropPages/ProcessingPage";
import CompletePage from "./cropPages/CompletePage";
import axios from "axios";
import styles from "../CSS/Pages/imageCrop.module.css";

function ImageCrop() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = interactive crop, 4 = processing, 5 = complete
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [croppedData, setCroppedData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
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
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFiles(imageFiles);
      setError(null);
      setFadeIn(false);
      setTimeout(() => {
        setPage(2);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleCropComplete = async (croppedAreaPixels) => {
    const newCroppedData = [...croppedData];
    newCroppedData[currentFileIndex] = croppedAreaPixels;
    setCroppedData(newCroppedData);

    // Move to next file or processing
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      // All files cropped, process them
      setFadeIn(false);
      setTimeout(async () => {
        setPage(4);
        setProcessingProgress(0);
        setFadeIn(true);

        const startTime = Date.now();
        const minProcessingTime = 1000;

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

        try {
          const formData = new FormData();
          
          // Add all cropped images
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const cropData = newCroppedData[i];
            
            formData.append('files', file);
            formData.append(`cropData_${i}`, JSON.stringify(cropData));
          }

          const response = await axios.post("http://localhost:3001/api/image/crop", formData, {
            responseType: 'blob',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const blob = response.data;
          const url = window.URL.createObjectURL(blob);
          const filename = files.length === 1 
            ? `cropped_${files[0].name}` 
            : "cropped_images.zip";
          
          setDownloadUrl(url);
          setDownloadFilename(filename);

          clearInterval(progressInterval);
          setProcessingProgress(100);

          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minProcessingTime - elapsedTime);

          setTimeout(() => {
            setFadeIn(false);
            setTimeout(() => {
              setPage(5);
              setFadeIn(true);
            }, 300);
          }, remainingTime + 500);

        } catch (error) {
          console.error("Crop error:", error);
          clearInterval(progressInterval);
          setProcessingProgress(0);
          setError(error.response?.data?.error || "Failed to crop images");
          setFadeIn(false);
          setTimeout(() => {
            setPage(3);
            setFadeIn(true);
          }, 300);
        }
      }, 300);
    }
  };

  const handleBackToCrop = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && downloadFilename) {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            
            // Actual download
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = downloadFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
              setIsDownloading(false);
              setHasDownloaded(true);
            }, 500);
            
            return 100;
          }
          return prev + 20;
        });
      }, 100);
    }
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setCurrentFileIndex(0);
      setCroppedData([]);
      setUploadProgress(0);
      setProcessingProgress(0);
      setDownloadProgress(0);
      setIsDownloading(false);
      setHasDownloaded(false);
      setDownloadUrl(null);
      setDownloadFilename("");
      setError(null);
      setFadeIn(true);
    }, 300);
  };

  const handleBackToUpload = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className={styles.imageCropPage}>
      <div className={styles.imageCropMain}>
        <div className={styles.imageCropContent}>
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

          {page === 2 && (
            <UploadingPage
              fadeIn={fadeIn}
              uploadProgress={uploadProgress}
            />
          )}

          {page === 3 && (
            <InteractiveCropPage
              fadeIn={fadeIn}
              file={files[currentFileIndex]}
              onCropComplete={handleCropComplete}
              onBack={handleBackToCrop}
              onBackToUpload={handleBackToUpload}
            />
          )}

          {page === 4 && (
            <ProcessingPage
              fadeIn={fadeIn}
              processingProgress={processingProgress}
            />
          )}

          {page === 5 && (
            <CompletePage
              fadeIn={fadeIn}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              hasDownloaded={hasDownloaded}
              downloadFilename={downloadFilename}
              onDownload={handleDownload}
              onNewCrop={handleReset}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ImageCrop;
