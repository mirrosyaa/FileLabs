import React, { useState } from "react";
import styles from "../CSS/Modals/logoutModal.module.css";

function LogoutModal({ isOpen, onClose, onConfirm }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirm();
    }, 300); // Match animation duration
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`${styles["logout-modal-overlay"]} ${
        isClosing ? styles.closing : ""
      }`}
      onClick={handleClose}
    >
      <div
        className={styles["logout-modal"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to logout?</p>
        <div className={styles["logout-modal-buttons"]}>
          <button className={styles["cancel-button"]} onClick={handleClose}>
            Cancel
          </button>
          <button className={styles["confirm-button"]} onClick={handleConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
