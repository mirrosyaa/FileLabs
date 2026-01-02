import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import DropBox from "../components/dropBox";
import ConversionOptions from "../components/ConversionOptions";
import styles from "../CSS/fileConverter.module.css";

function FileConverter() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
    setResult(null);
    setError(null);
  };

  const handleConvert = async (options) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("operation", options.operation);
    if (options.format) {
      formData.append("format", options.format);
    }
    if (options.renamePattern) {
      formData.append("renamePattern", options.renamePattern);
    }

    try {
      console.log('Sending conversion request...');
      console.log('FormData contents:', {
        files: files.map(f => f.name),
        operation: options.operation,
        format: options.format
      });
      
      const response = await fetch("http://localhost:3001/api/convert", {
        method: "POST",
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || "Conversion failed");
      }

      // Check if response is a file download
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setResult(data);
      } else {
        // Handle file download
        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "converted-file";
        
        if (contentDisposition) {
          // Extract filename from: attachment; filename="file.pdf"
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        console.log('Downloaded filename:', filename);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setResult({
          success: true,
          message: "File downloaded successfully!",
          filename: filename,
        });
      }
    } catch (err) {
      console.error("Conversion error:", err);
      console.error("Error stack:", err.stack);
      setError(err.message || "An error occurred during conversion. Check the console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className={styles.converterPage}>
      <Navbar />
      
      <main className={styles.converterMain}>
        <div className={styles.converterContent}>
          {!result && (
            <>
              <div className={styles.headerSection}>
                <h1 className={styles.pageTitle}>File Converter</h1>
              </div>
              <DropBox onFilesSelected={handleFilesSelected} />
              <ConversionOptions
                files={files}
                onConvert={handleConvert}
                isProcessing={isProcessing}
              />
            </>
          )}

          {error && (
            <div className={styles.messageContainer}>
              <div className={styles.errorCard}>
                <div className={styles.errorIcon}>❌</div>
                <h3 className={styles.errorTitle}>Error</h3>
                <p className={styles.errorMessage}>{error}</p>
                <button className={styles.resetBtn} onClick={handleReset}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className={styles.messageContainer}>
              <div className={styles.successCard}>
                <div className={styles.successIcon}>✅</div>
                <h3 className={styles.successTitle}>Success!</h3>
                <p className={styles.successMessage}>
                  {result.message || "Your files have been processed successfully."}
                </p>
                {result.filename && (
                  <p className={styles.filenameInfo}>
                    Downloaded: <strong>{result.filename}</strong>
                  </p>
                )}
                <button className={styles.resetBtn} onClick={handleReset}>
                  Process More Files
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
