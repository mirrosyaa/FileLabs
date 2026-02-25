import React, { useState, useEffect } from "react";
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
  const [processingProgress, setProcessingProgress] = useState(0); // eslint-disable-line no-unused-vars
  const [fadeIn, setFadeIn] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Watermark settings
  const [watermarkType, setWatermarkType] = useState("text"); // "text" or "image"
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState("bottom-right");
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
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProcessingProgress(progress);
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setProcessedFileUrl(url);
      changePage("download");
    } catch (err) {
      console.error("Error adding watermark:", err);
      setError(err.response?.data?.message || "Failed to add watermark");
      changePage("watermark");
    }
  };

  const handleDownload = () => {
    if (hasDownloaded) return; // Prevent double downloads
    
    setFadeIn(false);
    setTimeout(() => {
      setFadeIn(true);
      setIsDownloading(true);
      setDownloadProgress(0);
      
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            
            // Start actual download
            const link = document.createElement("a");
            link.href = processedFileUrl;
            link.download = `watermarked_${files[0].name}`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              document.body.removeChild(link);
            }, 100);
            
            setIsDownloading(false);
            setHasDownloaded(true);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }, 300);
  };

  const handleReset = () => {
    setFiles([]);
    setWatermarkType("text");
    setWatermarkText("");
    setWatermarkImage(null);
    setWatermarkImageUrl(null);
    setAnchorPosition("bottom-right");
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
            <ProcessingPage fadeIn={fadeIn} />
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
