import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import styles from "../CSS/Pages/urlDownloader.module.css";

function UrlDownloader() {
  const [page, setPage] = useState(1); // 1 = input, 2 = downloading, 3 = complete
  const [url, setUrl] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [error, setError] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError(null);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleDownload = async () => {
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
      startDownload();
    }, 300);
  };

  const startDownload = async () => {
    setIsDownloading(true);
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
      }, 200);

      const response = await fetch("http://localhost:3001/api/download-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Download failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "download";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        // Extract filename from URL
        try {
          const urlPath = new URL(url).pathname;
          const urlFilename = urlPath.split("/").pop();
          if (urlFilename) {
            filename = urlFilename;
          }
        } catch (e) {
          console.error("Error extracting filename:", e);
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(downloadUrl);
      setDownloadFilename(filename);
      setDownloadProgress(100);

      setTimeout(() => {
        setIsDownloading(false);
        setFadeIn(false);
        setTimeout(() => {
          setPage(3);
          setFadeIn(true);
        }, 300);
      }, 500);
    } catch (error) {
      console.error("Download error:", error);
      setError(error.message || "Failed to download file");
      setIsDownloading(false);
      setFadeIn(false);
      setTimeout(() => {
        setPage(1);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleDownloadFile = () => {
    if (downloadUrl && downloadFilename) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setHasDownloaded(true);
    }
  };

  const handleReset = () => {
    setFadeIn(false);
    setTimeout(() => {
      setPage(1);
      setUrl("");
      setDownloadProgress(0);
      setIsDownloading(false);
      setHasDownloaded(false);
      setDownloadUrl(null);
      setDownloadFilename("");
      setError(null);
      setFadeIn(true);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && url.trim()) {
      handleDownload();
    }
  };

  return (
    <div className={styles.urlDownloaderPage}>
      <div className={styles.urlDownloaderMain}>
        <div className={styles.urlDownloaderContent}>
          <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
            <h1 className={styles.mainTitle}>Download from URL</h1>

            {page === 1 && (
              <div className={styles.inputContainer}>
                <div className={styles.urlInputBox}>
                  <input
                    type="text"
                    className={styles.urlInput}
                    placeholder="Enter file URL (e.g., https://example.com/file.pdf)"
                    value={url}
                    onChange={handleUrlChange}
                    onKeyPress={handleKeyPress}
                  />
                  {error && <p className={styles.errorMessage}>{error}</p>}
                </div>
                {url.trim() && !error && (
                  <button
                    className={styles.downloadButton}
                    onClick={handleDownload}
                  >
                    Download File
                  </button>
                )}
              </div>
            )}

            {page === 2 && (
              <div className={styles.downloadingContainer}>
                <div className={styles.downloadingBox}>
                  <div className={styles.spinner}></div>
                  <h2 className={styles.downloadingTitle}>Downloading...</h2>
                  <p className={styles.downloadingText}>Please wait while we fetch your file</p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{downloadProgress}%</p>
                </div>
              </div>
            )}

            {page === 3 && (
              <div className={styles.completeContainer}>
                <div className={styles.completeBox}>
                  <div className={styles.checkmark}>✓</div>
                  <h2 className={styles.completeTitle}>Download Complete!</h2>
                  <p className={styles.completeText}>Your file is ready</p>
                  <p className={styles.filename}>{downloadFilename}</p>
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.actionButton} ${styles.downloadBtn}`}
                      onClick={handleDownloadFile}
                    >
                      {hasDownloaded ? "Download Again" : "Download File"}
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.resetBtn}`}
                      onClick={handleReset}
                    >
                      Download Another File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UrlDownloader;
