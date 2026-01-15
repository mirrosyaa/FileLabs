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
      <button className={styles.backLink} onClick={handleReset}>
        ← Back
      </button>

      <div className={styles.urlSplitLayout}>
        {/* Video Preview - Left */}
        <div className={styles.urlVideoSection}>
          {(mediaInfo.previewUrl || mediaInfo.thumbnail) ? (
            <div className={styles.urlVideoPreviewBox}>
              {mediaInfo.previewUrl ? (
                <video
                  src={mediaInfo.previewUrl}
                  className={styles.urlVideoThumbnail}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  poster={mediaInfo.thumbnail}
                />
              ) : (
                <img
                  src={mediaInfo.thumbnail}
                  alt="Thumbnail"
                  className={styles.urlVideoThumbnail}
                />
              )}
              <div className={styles.urlVideoDetails}>
                <h3 className={styles.urlVideoTitle}>{mediaInfo.title}</h3>
                <div className={styles.urlVideoMetadata}>
                  {mediaInfo.duration && (
                    <span className={styles.urlMetaText}>
                      Duration: {mediaInfo.duration}
                    </span>
                  )}
                  {mediaInfo.uploader && (
                    <span className={styles.urlMetaText}>
                      By: {mediaInfo.uploader}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.urlVideoPreviewBox}>
              <div className={styles.urlNoThumbnail}>
                <h3 className={styles.urlVideoTitle}>{mediaInfo.title}</h3>
                {mediaInfo.uploader && (
                  <p className={styles.urlVideoUploader}>Source: {mediaInfo.uploader}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Format Options - Right */}
        <div className={styles.urlOptionsSection}>
          <h3 className={styles.urlSectionTitle}>Select Format</h3>
          
          <div className={styles.urlOptionsList}>
            {formatOptions.map((format) => (
              <button
                key={format.value}
                className={`${styles.urlOptionButton} ${
                  selectedFormat === format.value ? styles.urlOptionActive : ""
                } ${!format.available ? styles.urlOptionInactive : ""}`}
                onClick={() =>
                  format.available && setSelectedFormat(format.value)
                }
                disabled={!format.available}
              >
                <div className={styles.urlOptionContent}>
                  <div className={styles.urlOptionName}>{format.label}</div>
                  <div className={styles.urlOptionDescription}>{format.description}</div>
                </div>
                {!format.available && (
                  <div className={styles.urlNotAvailable}>Not Available</div>
                )}
              </button>
            ))}
          </div>

          {error && <div className={styles.urlError}>{error}</div>}

          {selectedFormat && (
            <button
              className={styles.urlDownloadButton}
              onClick={handleDownload}
            >
              Download {selectedFormat === "audio" ? "Audio" : "Video"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormatSelectionPage;
