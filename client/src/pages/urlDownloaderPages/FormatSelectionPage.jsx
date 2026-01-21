import React, { useState, useEffect } from "react";
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
  const [selectedQuality, setSelectedQuality] = useState("");
  const [selectedAudioBitrate, setSelectedAudioBitrate] = useState("");

  // Set default quality and bitrate when format changes
  useEffect(() => {
    if (mediaInfo?.qualityOptions) {
      const { videoResolutions, audioBitrates } = mediaInfo.qualityOptions;
      
      if (selectedFormat === 'video' || selectedFormat === 'video+audio') {
        // Default to highest resolution
        if (videoResolutions && videoResolutions.length > 0) {
          setSelectedQuality(videoResolutions[0].toString());
        }
      }
      
      if (selectedFormat === 'audio' || selectedFormat === 'video+audio') {
        // Default to 192kbps for audio
        if (audioBitrates && audioBitrates.length > 0) {
          const defaultBitrate = audioBitrates.includes(192) ? '192' : audioBitrates[0].toString();
          setSelectedAudioBitrate(defaultBitrate);
        }
      }
    }
  }, [selectedFormat, mediaInfo]);

  // Defensive: handle error or missing formats
  if (!mediaInfo || mediaInfo.error || !mediaInfo.formats) {
    return (
      <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
        <div className={styles.selectionBox}>
          <button className={styles.backLink} onClick={handleReset}>
            ← Back
          </button>
          <h2 className={styles.selectionTitle}>Error</h2>
          <div className={styles.errorBox}>
            {mediaInfo && mediaInfo.error
              ? mediaInfo.error + (mediaInfo.details ? `: ${mediaInfo.details}` : "")
              : "Media information could not be loaded. Please try another URL."}
          </div>
        </div>
      </div>
    );
  }

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
              setSelectedFormat('video+audio');
              handleDownload(selectedQuality, selectedAudioBitrate);
            }}
          >
            Download File
          </button>
        </div>
      </div>
    );
  }

  const videoResolutions = mediaInfo.qualityOptions?.videoResolutions || [2160, 1440, 1080, 720, 480, 360];
  const audioBitrates = mediaInfo.qualityOptions?.audioBitrates || [128, 160, 192, 256, 320];

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
          {mediaInfo.thumbnail ? (
            <div className={styles.urlVideoPreviewBox}>
              <img
                src={mediaInfo.thumbnail}
                alt="Thumbnail"
                className={styles.urlVideoThumbnail}
              />
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

          {/* Quality Selection for Video */}
          {selectedFormat && (selectedFormat === 'video' || selectedFormat === 'video+audio') && (
            <div className={styles.urlQualitySection}>
              <label className={styles.urlQualityLabel}>Video Quality:</label>
              <select 
                className={styles.urlQualitySelect}
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
              >
                {videoResolutions.map(res => (
                  <option key={res} value={res}>{res}p</option>
                ))}
              </select>
            </div>
          )}

          {/* Audio Bitrate Selection */}
          {selectedFormat && (selectedFormat === 'audio' || selectedFormat === 'video+audio') && (
            <div className={styles.urlQualitySection}>
              <label className={styles.urlQualityLabel}>Audio Bitrate:</label>
              <select 
                className={styles.urlQualitySelect}
                value={selectedAudioBitrate}
                onChange={(e) => setSelectedAudioBitrate(e.target.value)}
              >
                {audioBitrates.map(bitrate => (
                  <option key={bitrate} value={bitrate}>{bitrate}kbps</option>
                ))}
              </select>
            </div>
          )}

          {error && <div className={styles.urlError}>{error}</div>}

          {selectedFormat && (
            <button
              className={styles.urlDownloadButton}
              onClick={() => handleDownload(selectedQuality, selectedAudioBitrate)}
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
