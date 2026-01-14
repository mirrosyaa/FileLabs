import React, { useState } from "react";
import styles from "../CSS/Pages/CropPages/common.module.css";
import Footer from "../components/Layout/footer";
import UploadPage from "./cropPages/UploadPage";
import UploadingPage from "./cropPages/UploadingPage";
import InteractiveCropPage from "./cropPages/InteractiveCropPage";
import CroppingPage from "./cropPages/CroppingPage";
import DownloadPage from "./cropPages/DownloadPage";

function ImageCrop() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = crop, 4 = cropping, 5 = download
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [croppingProgress, setCroppingProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [croppedImages, setCroppedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState("");

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

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    } else {
      setError("Please upload image files only");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    );
    
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (selectedFiles) => {
    setFiles(selectedFiles);
    setError(null);
    setCurrentFileIndex(0);
    setCroppedImages([]);
    
    // Start uploading animation
    setFadeIn(false);
    setTimeout(() => {
      setPage(2);
      setUploadProgress(0);
      setFadeIn(true);
      
      // Simulate upload progress
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
      }, 100);
    }, 300);
  };

  const handleCropComplete = async (croppedData) => {
    // Start cropping page with progress
    setFadeIn(false);
    setTimeout(() => {
      setPage(4);
      setFadeIn(true);
      setCroppingProgress(0);
      
      // Simulate cropping progress
      const progressInterval = setInterval(() => {
        setCroppingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 150);

      // Process the cropped image
      processCroppedImage(croppedData, progressInterval);
    }, 300);
  };

  const processCroppedImage = async (croppedData, progressInterval) => {
    try {
      const formData = new FormData();
      formData.append('files', croppedData.file);
      formData.append('cropData_0', JSON.stringify(croppedData.cropArea));

      const response = await fetch('http://localhost:3001/api/image/crop', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setCroppingProgress(100);

      if (!response.ok) {
        throw new Error('Crop failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `cropped_${Date.now()}.jpg`;

      setDownloadUrl(url);
      setDownloadFilename(filename);

      // Move to download page
      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPage(5);
          setFadeIn(true);
          setIsDownloading(false);
          setHasDownloaded(false);
          console.log('Download page loaded, ready to download');
        }, 300);
      }, 800);

    } catch (err) {
      console.error('Crop error:', err);
      setError('Failed to crop image. Please try again.');
      handleReset();
    }
  };

  const handleDownload = () => {
    console.log('Download clicked', { downloadUrl, downloadFilename, isDownloading });
    if (!downloadUrl || !downloadFilename) {
      console.error('No download URL or filename');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    console.log('Starting download progress...');

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        console.log('Download progress:', prev);
        if (prev >= 100) {
          clearInterval(interval);
          console.log('Download complete, triggering file download');
          
          // Trigger actual download only once
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = downloadFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setIsDownloading(false);
            setHasDownloaded(true);
          }, 300);
          
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  const handleReset = () => {
    // Clean up download URL if it exists
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
    }
    
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setCurrentFileIndex(0);
      setCroppedImages([]);
      setUploadProgress(0);
      setCroppingProgress(0);
      setDownloadProgress(0);
      setError(null);
      setIsDownloading(false);
      setHasDownloaded(false);
      setDownloadUrl(null);
      setDownloadFilename("");
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className={styles.imageCropPage}>
      <main className={styles.imageCropMain}>
        <div className={styles.imageCropContent}>
          {/* PAGE 1: Upload */}
          {page === 1 && (
            <UploadPage
              fadeIn={fadeIn}
              isDragging={isDragging}
              error={error}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
            />
          )}

          {/* PAGE 2: Uploading */}
          {page === 2 && (
            <UploadingPage fadeIn={fadeIn} uploadProgress={uploadProgress} />
          )}

          {/* PAGE 3: Interactive Crop */}
          {page === 3 && files.length > 0 && (
            <InteractiveCropPage
              fadeIn={fadeIn}
              file={files[currentFileIndex]}
              currentIndex={currentFileIndex}
              totalFiles={files.length}
              onCropComplete={handleCropComplete}
              onCancel={handleReset}
            />
          )}

          {/* PAGE 4: Cropping */}
          {page === 4 && (
            <CroppingPage fadeIn={fadeIn} croppingProgress={croppingProgress} />
          )}

          {/* PAGE 5: Download */}
          {page === 5 && (
            <DownloadPage
              fadeIn={fadeIn}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              hasDownloaded={hasDownloaded}
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

export default ImageCrop;
