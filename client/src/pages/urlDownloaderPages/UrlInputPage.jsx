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

      <div className={styles.urlBox}>
        <p className={styles.urlBoxText}>Paste video or file URL</p>
        <input
          type="text"
          className={styles.urlInput}
          placeholder="https://example.com/video.mp4"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        {url.trim() && !error && (
          <button className={styles.continueButton} onClick={handleFetchInfo}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default UrlInputPage;
