const ytdl = require("@distube/ytdl-core");
const { formatDuration } = require("./utils");

async function getYouTubeInfo(url) {
  const info = await ytdl.getInfo(url);
  const videoDetails = info.videoDetails;

  // Get available video resolutions
  const videoFormats = info.formats.filter(f => f.hasVideo);
  const resolutions = [...new Set(videoFormats.map(f => f.height).filter(Boolean))];
  resolutions.sort((a, b) => b - a); // Sort descending
  
  // Get available audio bitrates
  const audioFormats = info.formats.filter(f => f.hasAudio && f.audioBitrate);
  const audioBitrates = [...new Set(audioFormats.map(f => f.audioBitrate).filter(Boolean))];
  audioBitrates.sort((a, b) => b - a); // Sort descending
  
  // Limit audio bitrates to max 320
  const limitedAudioBitrates = audioBitrates.filter(b => b <= 320).slice(0, 4);
  if (limitedAudioBitrates.length === 0) limitedAudioBitrates.push(128, 192, 256, 320);

  return {
    title: videoDetails.title || "Unknown Title",
    duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
    durationSeconds: parseInt(videoDetails.lengthSeconds) || 0,
    thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || null,
    uploader: videoDetails.author?.name || videoDetails.ownerChannelName || "Unknown",
    formats: {
      hasVideo: true,
      hasAudio: true,
    },
    qualityOptions: {
      videoResolutions: resolutions.length > 0 ? resolutions : [2160, 1440, 1080, 720, 480, 360],
      audioBitrates: limitedAudioBitrates.length > 0 ? limitedAudioBitrates : [128, 160, 192, 256, 320]
    },
    originalUrl: url,
    platform: 'youtube',
  };
}

module.exports = { getYouTubeInfo };
