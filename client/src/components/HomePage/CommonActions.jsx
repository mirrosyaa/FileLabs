import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../CSS/Components/commonActions.module.css";

function CommonActions() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const commonActions = [
    { name: "Convert", icon: "" },
    { name: "Compress", icon: "" },
    { name: "Merge", icon: "" },
    { name: "Cut", icon: "" },
    { name: "Resize", icon: "" },
  ];

  const fileTypeOptions = [
    { type: "Documents", icon: "", path: "/tools/documents/" },
    { type: "Images", icon: "", path: "/tools/images/" },
    { type: "Audio", icon: "", path: "/tools/audio/" },
    { type: "Video", icon: "", path: "/tools/video/" },
  ];

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setShowModal(true);
  };

  const handleFileTypeSelect = (fileType) => {
    const actionName = selectedAction.name.toLowerCase().replace(/\s/g, "-");
    const path = `${fileType.path}${actionName}`;
    setShowModal(false);
    navigate(path);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAction(null);
  };

  return (
    <>
      <div className={styles.commonActionsSection}>
        <h2 className={styles.sectionTitle}>Common Actions</h2>
        <div className={styles.actionsRow}>
          {commonActions.map((action, index) => (
            <button
              key={index}
              className={styles.commonActionButton}
              onClick={() => handleActionClick(action)}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionName}>{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal for file type selection */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            <h3 className={styles.modalTitle}>
              Select File Type for {selectedAction?.name}
            </h3>
            <p className={styles.modalSubtitle}>
              Choose what type of files you want to{" "}
              {selectedAction?.name.toLowerCase()}
            </p>
            <div className={styles.fileTypeGrid}>
              {fileTypeOptions.map((fileType, index) => (
                <button
                  key={index}
                  className={styles.fileTypeOption}
                  onClick={() => handleFileTypeSelect(fileType)}
                >
                  <span className={styles.fileTypeIcon}>{fileType.icon}</span>
                  <span className={styles.fileTypeName}>{fileType.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CommonActions;
