const { getYouTubeInfo } = require("./youtube");
const { getTikTokInfo } = require("./tiktok");
const { getInstagramInfo } = require("./instagram");
const { getFacebookInfo } = require("./facebook");
const { detectPlatform } = require("./utils");

async function getMediaInfo(url) {
  const platform = detectPlatform(url);
  console.log("Detected platform:", platform);

  switch (platform) {
    case 'youtube':
      return await getYouTubeInfo(url);
      
    case 'tiktok':
      return await getTikTokInfo(url);
      
    case 'instagram':
      return await getInstagramInfo(url);
      
    case 'facebook':
      return await getFacebookInfo(url);
      
    case 'twitter':
      return {
        title: "Twitter/X Video",
        duration: "Unknown",
        durationSeconds: 0,
        thumbnail: null,
        uploader: "Twitter/X",
        formats: {
          hasVideo: true,
          hasAudio: true,
        },
        originalUrl: url,
        platform: 'twitter',
      };
      
    default:
      // Direct URL
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop() || 'download';
      
      return {
        title: filename,
        duration: "Unknown",
        durationSeconds: 0,
        thumbnail: null,
        uploader: urlObj.hostname,
        formats: {
          hasVideo: false,
          hasAudio: false,
        },
        originalUrl: url,
        platform: 'direct',
      };
  }
}

module.exports = { getMediaInfo };
