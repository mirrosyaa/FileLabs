const { instagramGetUrl } = require("instagram-url-direct");

async function getInstagramInfo(url) {
  const links = await instagramGetUrl(url);
  
  return {
    title: "Instagram Video",
    duration: "Unknown",
    durationSeconds: 0,
    thumbnail: links.thumb || null,
    previewUrl: (links.url_list && links.url_list.length > 0) ? links.url_list[0] : null,
    uploader: "Instagram",
    formats: {
      hasVideo: true,
      hasAudio: true,
    },
    originalUrl: url,
    platform: 'instagram',
    downloadUrls: {
      video: links.url_list || []
    }
  };
}

module.exports = { getInstagramInfo };
