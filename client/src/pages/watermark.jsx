import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Footer from "../components/Layout/footer";
import styles from "../CSS/Pages/fileConverter.module.css";
import UploadPage from "./watermarkPages/UploadPage";
import UploadingPage from "./watermarkPages/UploadingPage";
import WatermarkPage from "./watermarkPages/WatermarkPage";
import ProcessingPage from "./watermarkPages/ProcessingPage";
import DownloadPage from "./watermarkPages/DownloadPage";

function Watermark() {
  const [currentPage, setCurrentPage] = useState("upload");
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadTriggeredRef = useRef(false);
  
  // Watermark settings
  const [watermarkType, setWatermarkType] = useState("text"); // "text" or "image"
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState("bottom-right");
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 90, y: 90 });
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.8);
  const [watermarkColor, setWatermarkColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(4); // percentage of shorter side
  const [rotation, setRotation] = useState(0);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // PDF specific settings
  const [pdfPages, setPdfPages] = useState("all"); // "all", "first", "range"
  const [pdfPageRange, setPdfPageRange] = useState("");
  const [tiledMode, setTiledMode] = useState(false);
  
  const [processedFileUrl, setProcessedFileUrl] = useState(null);
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);

  const changePage = (newPage) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentPage(newPage);
      setFadeIn(true);
    }, 300);
  };

  const handleFiles = (selectedFiles) => {
    const validExtensions = [
      ".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".m4v",
      ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".tiff",
      ".pdf"
    ];

    const fileArray = Array.from(selectedFiles);
    const invalidFiles = fileArray.filter(
      (file) => !validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file type(s). Please upload video, image, or PDF files only.`
      );
      return;
    }

    setFiles(fileArray);
    setError("");
    
    // Create preview URLs for all files
    const urls = fileArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    changePage("uploading");
    simulateUpload();
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          changePage("watermark");
        }, 500);
      }
    }, 200);
  };

  const handleProcess = async () => {
    if (watermarkType === "text" && !watermarkText.trim()) {
      setError("Please enter watermark text");
      return;
    }
    if (watermarkType === "image" && !watermarkImage) {
      setError("Please select a watermark image");
      return;
    }

    changePage("processing");
    
    // Start progress at 5% immediately
    setProcessingProgress(5);

    // Simulate processing progress since server doesn't send updates
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          // Stop at 90% and wait for actual response
          return prev;
        }
        return prev + 5;
      });
    }, 300);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    
    // Watermark settings
    formData.append("watermarkType", watermarkType);
    if (watermarkType === "text") {
      formData.append("watermarkText", watermarkText);
      formData.append("fontFamily", fontFamily);
      formData.append("fontSize", fontSize);
      formData.append("color", watermarkColor);
      formData.append("strokeEnabled", strokeEnabled);
      formData.append("strokeColor", strokeColor);
      formData.append("strokeWidth", strokeWidth);
    } else {
      formData.append("watermarkImage", watermarkImage);
    }
    
    formData.append("anchorPosition", anchorPosition);
    formData.append("customPositionX", watermarkPosition.x);
    formData.append("customPositionY", watermarkPosition.y);
    formData.append("opacity", watermarkOpacity);
    formData.append("rotation", rotation);
    
    // PDF settings
    formData.append("pdfPages", pdfPages);
    if (pdfPages === "range") {
      formData.append("pdfPageRange", pdfPageRange);
    }
    formData.append("tiledMode", tiledMode);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/watermark/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      clearInterval(progressInterval);
      setProcessingProgress(100);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setProcessedFileUrl(url);
      
      setTimeout(() => {
        changePage("download");
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error adding watermark:", err);
      setError(err.response?.data?.message || "Failed to add watermark");
      changePage("watermark");
    }
  };

  const handleDownload = () => {
    console.log("handleDownload called, hasDownloaded:", hasDownloaded, "downloadTriggered:", downloadTriggeredRef.current);
    if (hasDownloaded || downloadTriggeredRef.current) {
      console.log("Download already triggered, returning");
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
      console.log("Executing download after timeout");
      const link = document.createElement("a");
      link.href = processedFileUrl;
      link.download = `watermarked_${files[0].name}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      console.log("Download link clicked");
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        setIsDownloading(false);
        setHasDownloaded(true);
        console.log("Download complete, hasDownloaded set to true");
      }, 100);
    }, 1100); // Wait for progress to complete (100ms * 10 + buffer)
  };

  const handleReset = () => {
    setFiles([]);
    setWatermarkType("text");
    setWatermarkText("");
    setWatermarkImage(null);
    setWatermarkImageUrl(null);
    setAnchorPosition("bottom-right");
    setWatermarkPosition({ x: 90, y: 90 });
    setWatermarkOpacity(0.8);
    setWatermarkColor("#ffffff");
    setFontFamily("Arial");
    setFontSize(4);
    setRotation(0);
    setStrokeEnabled(true);
    setStrokeColor("#000000");
    setStrokeWidth(2);
    setPdfPages("all");
    setPdfPageRange("");
    setTiledMode(false);
    setUploadProgress(0);
    setProcessingProgress(0);
    setProcessedFileUrl(null);
    setIsDownloading(false);
    setHasDownloaded(false);
    setDownloadProgress(0);
    downloadTriggeredRef.current = false;
    setError("");
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    changePage("upload");
  };

  return (
    <div className={styles.converterPage}>
      <div className={styles.converterMain}>
        <div className={styles.converterContent}>
          {currentPage === "upload" && (
            <UploadPage
              fadeIn={fadeIn}
              onFilesSelected={handleFiles}
              error={error}
            />
          )}
          {currentPage === "uploading" && (
            <UploadingPage fadeIn={fadeIn} uploadProgress={uploadProgress} />
          )}
          {currentPage === "watermark" && (
            <WatermarkPage
              fadeIn={fadeIn}
              files={files}
              watermarkType={watermarkType}
              setWatermarkType={setWatermarkType}
              watermarkText={watermarkText}
              setWatermarkText={setWatermarkText}
              watermarkImage={watermarkImage}
              setWatermarkImage={setWatermarkImage}
              watermarkImageUrl={watermarkImageUrl}
              setWatermarkImageUrl={setWatermarkImageUrl}
              anchorPosition={anchorPosition}
              setAnchorPosition={setAnchorPosition}
              watermarkPosition={watermarkPosition}
              setWatermarkPosition={setWatermarkPosition}
              watermarkOpacity={watermarkOpacity}
              setWatermarkOpacity={setWatermarkOpacity}
              watermarkColor={watermarkColor}
              setWatermarkColor={setWatermarkColor}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              fontSize={fontSize}
              setFontSize={setFontSize}
              rotation={rotation}
              setRotation={setRotation}
              strokeEnabled={strokeEnabled}
              setStrokeEnabled={setStrokeEnabled}
              strokeColor={strokeColor}
              setStrokeColor={setStrokeColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              pdfPages={pdfPages}
              setPdfPages={setPdfPages}
              pdfPageRange={pdfPageRange}
              setPdfPageRange={setPdfPageRange}
              tiledMode={tiledMode}
              setTiledMode={setTiledMode}
              onProcess={handleProcess}
              error={error}
              previewUrls={previewUrls}
            />
          )}
          {currentPage === "processing" && (
            <ProcessingPage fadeIn={fadeIn} processingProgress={processingProgress} />
          )}
          {currentPage === "download" && (
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

export default Watermark;
