import React, { useState, useEffect } from "react";
import LoginForm from "../components/Forms/loginForm";
import styles from "../CSS/login.module.css";

function LoginPage() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Listen for navigation events
    const handleBeforeUnload = () => {
      setFadeOut(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div
      className={`${styles["login-page-container"]} ${
        fadeOut ? styles["fade-out"] : ""
      }`}
    >
      {/* animated star layers */}
      <div className={styles.stars} aria-hidden="true" />
      <div className={styles.twinkling} aria-hidden="true" />

      {/* floating file icons (pure SVG decorative) - increased count and color classes */}
      <div className={styles["files-floating"]} aria-hidden="true">
        <svg
          className={`${styles.file} ${styles.f1} ${styles.color1}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f2} ${styles.color2}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f3} ${styles.color3}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f4} ${styles.color4}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f5} ${styles.color1}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f6} ${styles.color2}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f7} ${styles.color3}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f8} ${styles.color4}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f9} ${styles.color1}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f10} ${styles.color2}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f11} ${styles.color3}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
        <svg
          className={`${styles.file} ${styles.f12} ${styles.color4}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5z" />
        </svg>
      </div>

      {/* centered login card (simple) */}
      <div className={styles["login-card"]} role="main">
        {/* brand removed to keep card minimal */}

        {/* simplified — LoginForm provides the inputs and button */}
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
