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
        { name: "Compress PDF", path: "/compressor" },
        { name: "Split and Merge PDF", path: "/tools/documents/merge-pdf" },
        { name: "Download from URL", path: "/url-downloader" },
        { name: "Add Metadata", path: "/tools/documents/metadata" },
        { name: "Add Watermarks", path: "/tools/watermark" },
      ],
    },
    {
      title: "Images",
      icon: "",
      color: "#e91e63",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Compress/Optimize", path: "/compressor" },
        { name: "Image Editor", path: "/tools/images/crop" },
        { name: "Add Metadata", path: "/tools/images/metadata" },
        { name: "Add Watermarks", path: "/tools/watermark" },
      ],
    },
    {
      title: "Audio",
      icon: "",
      color: "#9c27b0",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Trim", path: "/tools/audio/trim" },
        { name: "Compress", path: "/compressor" },
        { name: "Download from URL", path: "/url-downloader" },
        { name: "Edit Metadata", path: "/tools/audio/metadata" },
        { name: "Add Watermarks", path: "/tools/watermark" },
      ],
    },
    {
      title: "Video",
      icon: "",
      color: "#ff9800",
      actions: [
        { name: "Convert", path: "/file-converter" },
        { name: "Compress", path: "/compressor" },
        { name: "Cut/Trim", path: "/tools/video/cut" },
        { name: "Download from URL", path: "/url-downloader" },
        { name: "Change Resolution", path: "/tools/video/resolution" },
        { name: "Extract Audio", path: "/tools/video/extract-audio" },
        { name: "Add Metadata", path: "/tools/video/metadata" },
        { name: "Add Watermarks", path: "/tools/watermark" },
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
