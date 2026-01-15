import React from "react";
import styles from "../../CSS/Pages/urlDownloader.module.css";

function FormatSelectionPage({
  fadeIn,
  mediaInfo,
  selectedFormat,
  setSelectedFormat,
  handleDownload,
  handleReset,
  error,
}) {
  const formatOptions = [
    {
      value: "video+audio",
      label: "Video + Audio",
      description: "Download video with audio (MP4)",
      available: mediaInfo.formats.hasVideo && mediaInfo.formats.hasAudio,
    },
    {
      value: "video",
      label: "Video Only",
      description: "Download video without audio",
      available: mediaInfo.formats.hasVideo,
    },
    {
      value: "audio",
      label: "Audio Only",
      description: "Download audio only (MP3)",
      available: mediaInfo.formats.hasAudio,
    },
  ];

  // For non-YouTube URLs or platforms without format options, show direct download option
  const isDirectDownload = !mediaInfo.formats.hasVideo && !mediaInfo.formats.hasAudio;
  const isSimplePlatform = mediaInfo.platform && ['instagram', 'tiktok', 'facebook', 'twitter'].includes(mediaInfo.platform);

  if (isDirectDownload) {
    return (
      <div
        className={`${styles.pageContainer} ${
          fadeIn ? styles.fadeIn : styles.fadeOut
        }`}
      >
        <div className={styles.selectionBox}>
          <button className={styles.backLink} onClick={handleReset}>
            ← Back
          </button>

          <h2 className={styles.selectionTitle}>Ready to Download</h2>

          <div className={styles.fileInfo}>
            <h3 className={styles.mediaTitle}>{mediaInfo.title}</h3>
            {mediaInfo.uploader && (
              <p className={styles.fileSource}>Source: {mediaInfo.uploader}</p>
            )}
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <button
            className={`${styles.downloadButton} ${styles.slideIn}`}
            onClick={() => {
              setSelectedFormat('video+audio'); // Set a default
              handleDownload();
            }}
          >
            Download File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.pageContainer} ${
        fadeIn ? styles.fadeIn : styles.fadeOut
      }`}
    >
      <div className={styles.selectionBox}>
        <button className={styles.backLink} onClick={handleReset}>
          ← Back
        </button>

        <h2 className={styles.selectionTitle}>Select Download Format</h2>

        {/* Media Preview */}
        {mediaInfo.thumbnail ? (
          <div className={styles.mediaPreview}>
            <img
              src={mediaInfo.thumbnail}
              alt="Thumbnail"
              className={styles.thumbnail}
            />
            <div className={styles.mediaDetails}>
              <h3 className={styles.mediaTitle}>{mediaInfo.title}</h3>
              <div className={styles.mediaMetadata}>
                <span className={styles.metadataItem}>
                  Duration: {mediaInfo.duration}
                </span>
                {mediaInfo.uploader && (
                  <span className={styles.metadataItem}>
                    By: {mediaInfo.uploader}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.fileInfo}>
            <h3 className={styles.mediaTitle}>{mediaInfo.title}</h3>
            {mediaInfo.uploader && (
              <p className={styles.fileSource}>Source: {mediaInfo.uploader}</p>
            )}
          </div>
        )}

        {/* Format Options */}
        <div className={styles.formatOptions}>
          <div className={styles.formatButtons}>
            {formatOptions.map((format) => (
              <button
                key={format.value}
                className={`${styles.formatOption} ${
                  selectedFormat === format.value ? styles.selectedFormat : ""
                } ${!format.available ? styles.disabledFormat : ""}`}
                onClick={() =>
                  format.available && setSelectedFormat(format.value)
                }
                disabled={!format.available}
              >
                <div className={styles.formatDetails}>
                  <div className={styles.formatName}>{format.label}</div>
                  <div className={styles.formatDescription}>
                    {format.description}
                  </div>
                </div>
                {!format.available && (
                  <div className={styles.unavailableBadge}>Not Available</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {selectedFormat && (
          <button
            className={`${styles.downloadButton} ${styles.slideIn}`}
            onClick={handleDownload}
          >
            Download {selectedFormat === "audio" ? "Audio" : "Video"}
          </button>
        )}
      </div>
    </div>
  );
}

export default FormatSelectionPage;
