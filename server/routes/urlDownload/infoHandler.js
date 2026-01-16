
const { getYouTubeInfo } = require("./youtube");
const { getTikTokInfo } = require("./tiktok");
const { getInstagramInfo } = require("./instagram");
const { getFacebookInfo } = require("./facebook");
const { detectPlatform } = require("./utils");
const twitterGetUrl = require("twitter-downloader");

async function getMediaInfo(url) {
  const platform = detectPlatform(url);
  console.log("Detected platform:", platform);

  switch (platform) {
    case 'youtube':
      return await getYouTubeInfo(url);
    case 'tiktok':
      return await getTikTokInfo(url);
    case 'instagram':
      try {
        return await getInstagramInfo(url);
      } catch (err) {
        return {
          error: 'Failed to fetch Instagram video info',
          details: err.message,
          platform: 'instagram',
          originalUrl: url
        };
      }
    case 'facebook':
      return await getFacebookInfo(url);
    case 'twitter':
      try {
        const data = await twitterGetUrl(url);
        if (!data || !data.download || !Array.isArray(data.download) || data.download.length === 0) {
          throw new Error('No downloadable video found for this Twitter/X URL.');
        }
        // Pick the highest quality video
        const best = data.download.reduce((a, b) => (a.width > b.width ? a : b));
        return {
          title: data.text || 'Twitter/X Video',
          duration: 'Unknown',
          durationSeconds: 0,
          thumbnail: data.thumbnail || null,
          uploader: data.author || 'Twitter/X',
          formats: {
            hasVideo: true,
            hasAudio: true,
          },
          originalUrl: url,
          platform: 'twitter',
          downloadUrls: {
            video: data.download.map(v => v.url)
          }
        };
      } catch (err) {
        return {
          error: 'Failed to fetch Twitter/X video info',
          details: err.message,
          platform: 'twitter',
          originalUrl: url
        };
      }
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
