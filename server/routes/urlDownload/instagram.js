const { instagramGetUrl } = require("instagram-url-direct");

async function getInstagramInfo(url) {
  const links = await instagramGetUrl(url);
  
  console.log("Instagram API Response:", JSON.stringify(links, null, 2));
  
  // Try multiple possible thumbnail properties
  let thumbnail = null;
  if (links.thumb && typeof links.thumb === 'string' && links.thumb.startsWith('http')) {
    thumbnail = links.thumb;
  } else if (links.thumbnail && typeof links.thumbnail === 'string' && links.thumbnail.startsWith('http')) {
    thumbnail = links.thumbnail;
  } else if (links.url_list && links.url_list.length > 0) {
    // Use the video URL as fallback - browser will show first frame
    thumbnail = links.url_list[0];
  }
  
  console.log("Instagram thumbnail:", thumbnail);
  
  return {
    title: "Instagram Video",
    duration: "Unknown",
    durationSeconds: 0,
    thumbnail: thumbnail,
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
