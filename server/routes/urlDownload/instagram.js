const { instagramGetUrl } = require("instagram-url-direct");

async function getInstagramInfo(url) {
  const links = await instagramGetUrl(url);
  
  return {
    title: "Instagram Video",
    duration: "Unknown",
    durationSeconds: 0,
    thumbnail: links.thumb || null,
    uploader: "Instagram",
    formats: {
      hasVideo: true,
      hasAudio: true,
    },
    qualityOptions: {
      videoResolutions: [1080, 720, 480],
      audioBitrates: [128, 160, 192, 256]
    },
    originalUrl: url,
    platform: 'instagram',
    downloadUrls: {
      video: links.url_list || []
    }
  };
}

module.exports = { getInstagramInfo };
