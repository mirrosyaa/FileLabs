import React from "react";
import styles from "../../CSS/Pages/urlDownloader.module.css";

function UrlInputPage({ fadeIn, url, setUrl, error, handleFetchInfo }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && url.trim()) {
      handleFetchInfo();
    }
  };

  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      <h1 className={styles.mainTitle}>Download from URL</h1>
      <p className={styles.subtitle}>
        Download videos and audio from YouTube
      </p>

      <div className={styles.inputContainer}>
        <div className={styles.urlInputBox}>
          <input
            type="text"
            className={styles.urlInput}
            placeholder="Paste YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>

        {url.trim() && !error && (
          <button className={styles.fetchButton} onClick={handleFetchInfo}>
            Continue
          </button>
        )}
      </div>

      <div className={styles.infoBoxes}>
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>🎥</div>
          <div className={styles.infoText}>Videos</div>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>🎵</div>
          <div className={styles.infoText}>Audio</div>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>⚡</div>
          <div className={styles.infoText}>Fast Downloads</div>
        </div>
      </div>
    </div>
  );
}

export default UrlInputPage;
