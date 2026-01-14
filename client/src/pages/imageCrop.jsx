import React, { useState } from "react";
import styles from "../CSS/Pages/CropPages/common.module.css";
import Footer from "../components/Layout/footer";
import UploadPage from "./cropPages/UploadPage";
import UploadingPage from "./cropPages/UploadingPage";
import InteractiveCropPage from "./cropPages/InteractiveCropPage";
import ProcessingPage from "./cropPages/ProcessingPage";
import CompletePage from "./cropPages/CompletePage";

function ImageCrop() {
  const [page, setPage] = useState(1); // 1 = upload, 2 = uploading, 3 = crop, 4 = processing, 5 = complete
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [croppedImages, setCroppedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [error, setError] = useState(null);

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

  const handleCropComplete = (croppedData) => {
    const updatedCroppedImages = [...croppedImages];
    updatedCroppedImages[currentFileIndex] = croppedData;
    setCroppedImages(updatedCroppedImages);

    // Move to next image or finish
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      // All images cropped, start processing
      setFadeIn(false);
      setTimeout(() => {
        setPage(4);
        setFadeIn(true);
        processAndDownload(updatedCroppedImages);
      }, 300);
    }
  };

  const handleSkipCrop = () => {
    // Skip current image and move to next or finish
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      // All images processed, go to complete
      if (croppedImages.filter(Boolean).length > 0) {
        setFadeIn(false);
        setTimeout(() => {
          setPage(4);
          setFadeIn(true);
          processAndDownload(croppedImages.filter(Boolean));
        }, 300);
      } else {
        setError("No images were cropped");
        handleReset();
      }
    }
  };

  const processAndDownload = async (croppedData) => {
    setProcessingProgress(0);
    
    try {
      const formData = new FormData();
      
      // Filter out skipped images
      const validCroppedData = croppedData.filter(Boolean);
      
      validCroppedData.forEach((data, index) => {
        formData.append('files', data.file);
        formData.append(`cropData_${index}`, JSON.stringify(data.cropArea));
      });

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

      const response = await fetch('http://localhost:5000/api/crop', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!response.ok) {
        throw new Error('Crop failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `cropped_${Date.now()}.${files.length === 1 ? 'jpg' : 'zip'}`;

      // Move to complete page
      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPage(5);
          setFadeIn(true);
          
          // Auto download
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 300);
      }, 800);

    } catch (err) {
      console.error('Crop error:', err);
      setError('Failed to crop images. Please try again.');
      handleReset();
    }
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setFiles([]);
      setCurrentFileIndex(0);
      setCroppedImages([]);
      setUploadProgress(0);
      setProcessingProgress(0);
      setError(null);
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
              onSkip={handleSkipCrop}
              onCancel={handleReset}
            />
          )}

          {/* PAGE 4: Processing */}
          {page === 4 && (
            <ProcessingPage fadeIn={fadeIn} processingProgress={processingProgress} />
          )}

          {/* PAGE 5: Complete */}
          {page === 5 && (
            <CompletePage fadeIn={fadeIn} onReset={handleReset} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ImageCrop;
