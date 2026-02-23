import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import styles from "../../CSS/Pages/fileConverter.module.css";

function SplitOptionsPage({
  fadeIn,
  files,
  handleBack,
  setPage,
  setDownloadUrl,
  setDownloadFilename,
  setFadeIn
}) {
  const [splitMode, setSplitMode] = useState("single-pages");
  const [pageRange, setPageRange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);

  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set();
    const parts = rangeStr.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end)) {
          throw new Error(`Invalid range: ${part}`);
        }
        if (start < 1 || end > maxPages || start > end) {
          throw new Error(`Invalid range: ${part}. Pages must be between 1 and ${maxPages}`);
        }
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      } else {
        const pageNum = parseInt(part);
        if (isNaN(pageNum)) {
          throw new Error(`Invalid page number: ${part}`);
        }
        if (pageNum < 1 || pageNum > maxPages) {
          throw new Error(`Page ${pageNum} is out of range (1-${maxPages})`);
        }
        pages.add(pageNum);
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (files.length !== 1) {
      setError("Please select exactly one PDF file for splitting");
      return;
    }

    if (splitMode === "page-range" && !pageRange.trim()) {
      setError("Please enter a page range");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      setProcessingProgress(20);

      let outputPdfs = [];

      if (splitMode === "single-pages") {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          outputPdfs.push({
            name: `page-${i + 1}.pdf`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
          });
          setProcessingProgress(20 + (60 * (i + 1) / totalPages));
        }
      } else {
        // Extract page range
        try {
          const pagesToExtract = parsePageRange(pageRange, totalPages);
          
          if (pagesToExtract.length === 0) {
            throw new Error("No valid pages specified");
          }

          const newPdf = await PDFDocument.create();
          const pageIndices = pagesToExtract.map(p => p - 1); // Convert to 0-based indices
          const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
          
          copiedPages.forEach(page => {
            newPdf.addPage(page);
          });

          const pdfBytes = await newPdf.save();
          outputPdfs.push({
            name: `extracted-pages.pdf`,
            blob: new Blob([pdfBytes], { type: 'application/pdf' })
          });
          
          setProcessingProgress(80);
        } catch (err) {
          throw new Error(err.message || "Invalid page range");
        }
      }

      setProcessingProgress(90);

      // If single PDF, download directly; if multiple, create ZIP
      if (outputPdfs.length === 1) {
        const url = URL.createObjectURL(outputPdfs[0].blob);
        setDownloadUrl(url);
        setDownloadFilename(outputPdfs[0].name);
      } else {
        // Create ZIP file
        const zip = new JSZip();
        outputPdfs.forEach(pdf => {
          zip.file(pdf.name, pdf.blob);
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        setDownloadUrl(url);
        setDownloadFilename('split-pages.zip');
      }

      setProcessingProgress(100);

      // Navigate to download page
      setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setIsProcessing(false);
          setPage(5);
          setFadeIn(true);
        }, 300);
      }, 500);

    } catch (err) {
      console.error("Split error:", err);
      setError(err.message || "Failed to split PDF");
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      {/* Processing Loading Overlay */}
      {isProcessing && (
        <div className={styles.uploadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.uploadingText}>Splitting PDF...</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{processingProgress}%</p>
        </div>
      )}

      {!isProcessing && (
        <div className={styles.conversionBox}>
          <button className={styles.backLink} onClick={handleBack}>
            ← Back to operations
          </button>

          <h2 className={styles.conversionTitle}>Split PDF</h2>

          <div className={styles.filesDisplay}>
            <div className={styles.filesHeader}>Selected File:</div>
            {files.map((file, idx) => (
                <div key={idx} className={styles.fileName}>
                  {file.name}
                </div>
              ))}
          </div>

          <div className={styles.formatOptions}>
            <div className={styles.formatLabel}>Choose Split Mode</div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '28px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setSplitMode("single-pages")}
                className={`${styles.formatOption} ${splitMode === "single-pages" ? styles.selectedFormat : ''}`}
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  minHeight: 'auto'
                }}
              >
                <div className={styles.formatName}>Single Pages</div>
                <div className={styles.formatDescription}>
                  Each page as separate PDF
                </div>
              </button>
              
              <button
                onClick={() => setSplitMode("page-range")}
                className={`${styles.formatOption} ${splitMode === "page-range" ? styles.selectedFormat : ''}`}
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  minHeight: 'auto'
                }}
              >
                <div className={styles.formatName}>Page Range</div>
                <div className={styles.formatDescription}>
                  Extract specific pages
                </div>
              </button>
            </div>

            {splitMode === "page-range" && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid rgba(94, 200, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                marginBottom: '16px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '8px'
                }}>
                  Enter Page Range
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-5, 7, 10-12"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '15px',
                    borderRadius: '8px',
                    border: '2px solid rgba(94, 200, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(94, 200, 255, 0.8)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(94, 200, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(94, 200, 255, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: '12px', 
                  marginTop: '8px',
                  marginBottom: '0',
                  lineHeight: '1.4'
                }}>
                  Example: "1-5, 7, 10-12"
                </p>
              </div>
            )}
          </div>

          <button
            className={`${styles.convertButton} ${styles.slideIn}`}
            onClick={handleSplit}
            disabled={isProcessing}
          >
            Split PDF
          </button>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SplitOptionsPage;
