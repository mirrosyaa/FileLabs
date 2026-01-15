import React, { useState } from "react";
import Footer from "../components/Layout/footer";
import UrlInputPage from "./urlDownloaderPages/UrlInputPage";
import FetchingPage from "./urlDownloaderPages/FetchingPage";
import FormatSelectionPage from "./urlDownloaderPages/FormatSelectionPage";
import DownloadingPage from "./urlDownloaderPages/DownloadingPage";
import CompletePage from "./urlDownloaderPages/CompletePage";
import styles from "../CSS/Pages/urlDownloader.module.css";

function UrlDownloader() {
  // 1 = input, 2 = fetching, 3 = format selection, 4 = downloading, 5 = complete
  const [page, setPage] = useState(1);
  const [url, setUrl] = useState("");
  const [mediaInfo, setMediaInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [fetchProgress, setFetchProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [downloadFileProgress, setDownloadFileProgress] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [error, setError] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    setError(null);
    setFadeIn(false);

    setTimeout(() => {
      setPage(2);
      setFadeIn(true);
      fetchMediaInfo();
    }, 300);
  };

  const fetchMediaInfo = async () => {
    setFetchProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFetchProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("http://localhost:3001/api/url-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch media info");
      }

      const data = await response.json();
      setMediaInfo(data);
      setFetchProgress(100);

      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPage(3);
          setFadeIn(true);
        }, 300);
      }, 500);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "Failed to fetch media information");
      setFadeIn(false);
      setTimeout(() => {
        setPage(1);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat) {
      setError("Please select a format");
      return;
    }

    setError(null);
    setFadeIn(false);

    setTimeout(() => {
      setPage(4);
      setFadeIn(true);
      startDownload();
    }, 300);
  };

  const startDownload = async () => {
    setDownloadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch("http://localhost:3001/api/download-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          url: mediaInfo.originalUrl,
          format: selectedFormat 
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Download failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "download";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(downloadUrl);
      setDownloadFilename(filename);
      setDownloadProgress(100);

      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPage(5);
          setFadeIn(true);
        }, 300);
      }, 500);
    } catch (error) {
      console.error("Download error:", error);
      setError(error.message || "Failed to download media");
      setFadeIn(false);
      setTimeout(() => {
        setPage(3);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleDownloadFile = async () => {
    if (!downloadUrl) return;

    setIsDownloadingFile(true);
    setDownloadFileProgress(0);

    // Simulate download progress for better UX
    const progressInterval = setInterval(() => {
      setDownloadFileProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    try {
      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 600));

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      clearInterval(progressInterval);
      setDownloadFileProgress(100);

      // Reset after download
      setTimeout(() => {
        setIsDownloadingFile(false);
        setDownloadFileProgress(0);
        setHasDownloaded(true);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      setIsDownloadingFile(false);
      setDownloadFileProgress(0);
      setError("Download failed. Please try again.");
    }
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setUrl("");
      setMediaInfo(null);
      setSelectedFormat("");
      setFetchProgress(0);
      setDownloadProgress(0);
      setIsDownloadingFile(false);
      setDownloadFileProgress(0);
      setHasDownloaded(false);
      setDownloadUrl(null);
      setDownloadFilename("");
      setError(null);
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className={styles.urlDownloaderPage}>
      <main className={styles.urlDownloaderMain}>
        <div className={styles.urlDownloaderContent}>
          {/* PAGE 1: URL Input */}
          {page === 1 && (
            <UrlInputPage
              fadeIn={fadeIn}
              url={url}
              setUrl={setUrl}
              error={error}
              handleFetchInfo={handleFetchInfo}
            />
          )}

          {/* PAGE 2: Fetching Info */}
          {page === 2 && (
            <FetchingPage fadeIn={fadeIn} fetchProgress={fetchProgress} />
          )}

          {/* PAGE 3: Format Selection */}
          {page === 3 && (
            <FormatSelectionPage
              fadeIn={fadeIn}
              mediaInfo={mediaInfo}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              handleDownload={handleDownload}
              handleReset={handleReset}
              error={error}
            />
          )}

          {/* PAGE 4: Downloading */}
          {page === 4 && (
            <DownloadingPage
              fadeIn={fadeIn}
              downloadProgress={downloadProgress}
            />
          )}

          {/* PAGE 5: Complete */}
          {page === 5 && (
            <CompletePage
              fadeIn={fadeIn}
              isDownloadingFile={isDownloadingFile}
              downloadFileProgress={downloadFileProgress}
              hasDownloaded={hasDownloaded}
              downloadFilename={downloadFilename}
              selectedFormat={selectedFormat}
              handleDownloadFile={handleDownloadFile}
              handleReset={handleReset}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UrlDownloader;
