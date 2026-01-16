const ytdl = require("@distube/ytdl-core");
const { formatDuration } = require("./utils");

async function getYouTubeInfo(url) {
  const info = await ytdl.getInfo(url);
  const videoDetails = info.videoDetails;

  // Get a low-quality video URL for preview
  const previewFormat = info.formats.find(format => 
    format.hasVideo && format.hasAudio && 
    (format.qualityLabel === '360p' || format.qualityLabel === '240p' || format.qualityLabel === '144p')
  ) || info.formats.find(format => format.hasVideo && format.hasAudio);

  return {
    title: videoDetails.title || "Unknown Title",
    duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
    durationSeconds: parseInt(videoDetails.lengthSeconds) || 0,
    thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || null,
    previewUrl: previewFormat?.url || null,
    uploader: videoDetails.author?.name || videoDetails.ownerChannelName || "Unknown",
    formats: {
      hasVideo: true,
      hasAudio: true,
    },
    originalUrl: url,
    platform: 'youtube',
  };
}

module.exports = { getYouTubeInfo };
