import React from "react";
import styles from "../CSS/Modals/sessionExpiredModal.module.css";

function SessionExpiredModal({ onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Session Expired</h2>
        <p className={styles.message}>
          Your session has expired for security reasons. Please log in again to continue.
        </p>
        <button className={styles.confirmButton} onClick={onClose}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default SessionExpiredModal;
