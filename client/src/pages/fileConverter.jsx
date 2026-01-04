import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import styles from "../CSS/fileConverter.module.css";

// File type detection helper
const detectFileType = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type;

  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
    return 'image';
  }
  
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg'].includes(ext)) {
    return 'audio';
  }
  
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv'].includes(ext)) {
    return 'video';
  }
  
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'html'].includes(ext)) {
    return 'document';
  }
  
  return 'unknown';
};

// Get conversion options based on file type
const getConversionOptions = (fileType, currentFiles = []) => {
  // Only document conversions are currently supported
  const options = {
    image: [],
    audio: [],
    video: [],
    document: [
      { value: 'pdf', label: 'PDF', icon: '📄' },
      { value: 'docx', label: 'DOCX', icon: '📄' },
      { value: 'txt', label: 'TXT', icon: '📄' },
      { value: 'rtf', label: 'RTF', icon: '📄' },
      { value: 'html', label: 'HTML', icon: '📄' },
    ],
  };
  
  let availableOptions = options[fileType] || [];
  
  // Filter out the source format(s) from the conversion options
  if (currentFiles.length > 0) {
    const sourceFormats = new Set(
      currentFiles.map(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        // Normalize extensions
        if (ext === 'jpeg') return 'jpg';
        if (ext === 'doc') return 'docx';
        return ext;
      })
    );
    
    availableOptions = availableOptions.filter(
      option => !sourceFormats.has(option.value)
    );
  }
  
  return availableOptions;
};

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
      
      // Small delay to show 100% before moving to download page
      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPage(4);
          setFadeIn(true);
        }, 300);
      }, 500);
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
      <Navbar />
      
      <main className={styles.converterMain}>
        <div className={styles.converterContent}>
          
          {/* PAGE 1: Upload */}
          {page === 1 && (
            <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
              <h1 className={styles.mainTitle}>File Converter</h1>
              
              <div 
                className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={styles.uploadIcon}>📁</div>
                <p className={styles.uploadText}>Drag & drop files here</p>
                <label className={styles.browseBtn}>
                  Browse Files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* PAGE 2: Uploading */}
          {page === 2 && (
            <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
              <div className={styles.uploadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.uploadingText}>Uploading files...</p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className={styles.progressText}>{uploadProgress}%</p>
              </div>
            </div>
          )}

          {/* PAGE 3: Choose Conversion */}
          {page === 3 && (
            <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
              <button className={styles.backLink} onClick={handleReset}>
                ← Back to upload
              </button>
              
              <h2 className={styles.conversionTitle}>Convert To</h2>
              
              {/* Conversion Loading Overlay */}
              {isConverting && (
                <div className={styles.convertingOverlay}>
                  <div className={styles.spinner}></div>
                  <p className={styles.uploadingText}>Converting files...</p>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${conversionProgress}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{conversionProgress}%</p>
                </div>
              )}
              
              {hasMixedTypes && (
                <div className={styles.warningBox}>
                  ⚠️ Mixed file types detected. Please upload one type at a time.
                </div>
              )}


              {!hasMixedTypes && primaryFileType && primaryFileType !== 'unknown' && (
                <>
                  {getConversionOptions(primaryFileType, files).length > 0 ? (
                    <div className={styles.formatOptions}>
                      <div className={styles.formatButtons}>
                        {getConversionOptions(primaryFileType, files).map((format) => (
                          <button
                            key={format.value}
                            className={`${styles.formatOption} ${selectedFormat === format.value ? styles.selectedFormat : ''}`}
                            onClick={() => setSelectedFormat(format.value)}
                          >
                            <span className={styles.formatIcon}>{format.icon}</span>
                            <span className={styles.formatName}>{format.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.errorBox}>
                      ❌ {primaryFileType === 'document' 
                        ? 'No conversion options available. File is already in this format.'
                        : 'Only document conversions are currently supported (PDF, DOCX, TXT, RTF, HTML).'}
                    </div>
                  )}

                  <div className={styles.filesDisplay}>
                    <div className={styles.filesHeader}>Selected Files:</div>
                    {Object.entries(fileTypes).map(([type, typeFiles]) => (
                      <div key={type} className={styles.fileTypeSection}>
                        <div className={styles.fileTypeLabel}>
                          {type === 'image' && '🖼️'}
                          {type === 'audio' && '🎵'}
                          {type === 'video' && '🎬'}
                          {type === 'document' && '📄'}
                          {type === 'unknown' && '❓'}
                          {' '}
                          {type.charAt(0).toUpperCase() + type.slice(1)} ({typeFiles.length})
                        </div>
                        <div className={styles.fileNames}>
                          {typeFiles.map((file, idx) => (
                            <div key={idx} className={styles.fileName}>{file.name}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedFormat && getConversionOptions(primaryFileType, files).length > 0 && (
                    <button 
                      className={`${styles.convertButton} ${styles.slideIn}`}
                      onClick={handleConvert}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <>
                          <span className={styles.buttonSpinner}></span>
                          Converting...
                        </>
                      ) : (
                        <>
                          Convert to {selectedFormat.toUpperCase()}
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {(primaryFileType === 'unknown' && !hasMixedTypes) && (
                <div className={styles.errorBox}>
                  ❌ Unsupported file type. Please upload document files (PDF, DOCX, TXT, RTF, HTML).
                </div>
              )}

              {error && (
                <div className={styles.errorBox}>
                  ❌ {error}
                </div>
              )}
            </div>
          )}

          {/* PAGE 4: Download */}
          {page === 4 && (
            <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
              {/* Download Loading Overlay */}
              {isDownloading && (
                <div className={styles.downloadingOverlay}>
                  <div className={styles.spinner}></div>
                  <p className={styles.uploadingText}>Downloading file...</p>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>{downloadProgress}%</p>
                </div>
              )}

              <div className={styles.successContainer}>
                <div className={styles.successIconWrapper}>
                  <div className={styles.successIconCircle}>
                    <div className={styles.successIcon}>✓</div>
                  </div>
                </div>
                {!hasDownloaded ? (
                  <>
                    <h2 className={styles.successTitle}>Conversion Complete!</h2>
                    <p className={styles.successMessage}>Your file has been successfully converted</p>
                  </>
                ) : (
                  <h2 className={styles.successTitle}>File Downloaded Successfully!</h2>
                )}
                
                <div className={styles.downloadFileInfo}>
                  <div className={styles.fileInfoIcon}>📄</div>
                  <div className={styles.fileInfoText}>
                    <div className={styles.fileName}>{downloadFilename}</div>
                    <div className={styles.fileFormat}>Format: {selectedFormat.toUpperCase()}</div>
                  </div>
                </div>

                {!hasDownloaded && (
                  <button 
                    className={styles.downloadButton} 
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <span className={styles.buttonSpinner}></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <span className={styles.downloadIcon}>⬇</span>
                        Download File
                      </>
                    )}
                  </button>
                )}
                <button className={styles.newConversionBtn} onClick={handleReset}>
                  ← Convert Another File
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FileConverter;
