import React, { useState } from "react";
import styles from "../CSS/conversionOptions.module.css";

function ConversionOptions({ files, onConvert, isProcessing }) {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [renamePattern, setRenamePattern] = useState("");

  const operations = [
    { id: "convert", label: "Convert Format", icon: "🔄", requiresFormat: true },
    { id: "compress", label: "Compress PDF", icon: "🗜️", requiresFormat: false },
    { id: "merge", label: "Split and Merge PDFs", icon: "📎", requiresFormat: false },
    { id: "split", label: "Split PDF", icon: "✂️", requiresFormat: false },
    { id: "extract", label: "Extract Images", icon: "🖼️", requiresFormat: false },
    { id: "ocr", label: "OCR (Scan to Text)", icon: "📝", requiresFormat: false },
    { id: "rename", label: "Batch Rename", icon: "✏️", requiresFormat: false },
  ];

  const formats = [
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "DOCX" },
    { value: "txt", label: "TXT" },
    { value: "rtf", label: "RTF" },
    { value: "html", label: "HTML" },
  ];

  const handleConvert = () => {
    if (!selectedOperation) {
      alert("Please select an operation");
      return;
    }

    const operation = operations.find(op => op.id === selectedOperation);
    if (operation.requiresFormat && !selectedFormat) {
      alert("Please select a target format");
      return;
    }

    if (selectedOperation === "rename" && !renamePattern) {
      alert("Please enter a rename pattern");
      return;
    }

    onConvert({
      operation: selectedOperation,
      format: selectedFormat,
      renamePattern: renamePattern,
    });
  };

  if (files.length === 0) {
    return null;
  }

  const selectedOp = operations.find(op => op.id === selectedOperation);

  return (
    <div className={styles.optionsContainer}>
      <div className={styles.optionsCard}>
        <h2 className={styles.title}>Choose Operation</h2>
        
        <div className={styles.operationsGrid}>
          {operations.map((op) => (
            <button
              key={op.id}
              className={`${styles.operationBtn} ${
                selectedOperation === op.id ? styles.operationBtnActive : ""
              }`}
              onClick={() => setSelectedOperation(op.id)}
              disabled={isProcessing}
            >
              <span className={styles.operationIcon}>{op.icon}</span>
              <span className={styles.operationLabel}>{op.label}</span>
            </button>
          ))}
        </div>

        {selectedOp && selectedOp.requiresFormat && (
          <div className={styles.formatSection}>
            <label className={styles.formatLabel}>Target Format:</label>
            <select
              className={styles.formatSelect}
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              disabled={isProcessing}
            >
              <option value="">Select format...</option>
              {formats.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedOperation === "rename" && (
          <div className={styles.formatSection}>
            <label className={styles.formatLabel}>Rename Pattern:</label>
            <input
              type="text"
              className={styles.renameInput}
              placeholder="e.g., Document_{n} or File_{date}"
              value={renamePattern}
              onChange={(e) => setRenamePattern(e.target.value)}
              disabled={isProcessing}
            />
            <p className={styles.renameHint}>
              Use {"{n}"} for numbers, {"{date}"} for date, {"{original}"} for original name
            </p>
          </div>
        )}

        <div className={styles.filesList}>
          <p className={styles.filesLabel}>
            {files.length} file{files.length > 1 ? "s" : ""} selected:
          </p>
          <div className={styles.filesItems}>
            {files.map((file, idx) => (
              <div key={idx} className={styles.fileItem}>
                <span className={styles.fileIcon}>📄</span>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.convertBtn}
          onClick={handleConvert}
          disabled={isProcessing || !selectedOperation}
        >
          {isProcessing ? (
            <>
              <span className={styles.spinner}></span>
              Processing...
            </>
          ) : (
            `Process ${files.length} File${files.length > 1 ? "s" : ""}`
          )}
        </button>
      </div>
    </div>
  );
}

export default ConversionOptions;
