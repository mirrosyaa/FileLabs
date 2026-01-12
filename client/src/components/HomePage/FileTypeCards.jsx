import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../CSS/Components/fileTypeCards.module.css";

function FileTypeCards() {
  const navigate = useNavigate();

  const fileTypes = [
    {
      title: "Documents",
      icon: "",
      color: "#4a9fd8",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Compress PDF", path: "/tools/documents/compress-pdf" },
        { name: "Merge PDF", path: "/tools/documents/merge-pdf" },
        { name: "Download from URL", path: "/document-tools/download-url" },
        { name: "Auto Rename", path: "/tools/documents/auto-rename" },
        { name: "Extract Images", path: "/tools/documents/extract-images" },
      ],
    },
    {
      title: "Images",
      icon: "",
      color: "#e91e63",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Compress/Optimize", path: "/tools/images/compress" },
        { name: "Resize", path: "/tools/images/resize" },
        { name: "Crop", path: "/tools/images/crop" },
        { name: "Add Metadata", path: "/tools/images/metadata" },
        { name: "Add Watermarks", path: "/tools/images/watermark" },
      ],
    },
    {
      title: "Audio",
      icon: "",
      color: "#9c27b0",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Trim", path: "/tools/audio/trim" },
        { name: "Merge", path: "/tools/audio/merge" },
        { name: "Compress", path: "/tools/audio/compress" },
        { name: "Edit Metadata", path: "/tools/audio/metadata" },
        { name: "Normalize Volume", path: "/tools/audio/normalize" },
      ],
    },
    {
      title: "Video",
      icon: "",
      color: "#ff9800",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Compress", path: "/tools/video/compress" },
        { name: "Cut/Trim", path: "/tools/video/cut" },
        { name: "Merge", path: "/tools/video/merge" },
        { name: "Change Resolution", path: "/tools/video/resolution" },
        { name: "Extract Audio", path: "/tools/video/extract-audio" },
        { name: "Auto Split", path: "/tools/video/auto-split" },
      ],
    },
  ];

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.fileTypeSection}>
      <div className={styles.cardsGrid}>
        {fileTypes.map((type, index) => (
          <div
            key={index}
            className={styles.card}
            style={{ "--card-color": type.color }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{type.title}</h3>
            </div>
            <div className={styles.actionsGrid}>
              {type.actions.map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  className={styles.actionButton}
                  onClick={() => handleActionClick(action.path)}
                >
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileTypeCards;
