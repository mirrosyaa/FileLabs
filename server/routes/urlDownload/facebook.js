const { getFbVideoInfo } = require("fb-downloader-scrapper");

async function getFacebookInfo(url) {
  try {
    console.log("Calling Facebook downloader for:", url);
    
    const fbData = await getFbVideoInfo(url);
    
    console.log("Facebook API response:", fbData);
    
    if (fbData && (fbData.hd || fbData.sd)) {
      return {
        title: fbData.title || "Facebook Video",
        duration: "Unknown",
        durationSeconds: 0,
        thumbnail: null,
        uploader: "Facebook",
        formats: {
          hasVideo: true,
          hasAudio: true,
        },
        qualityOptions: {
          videoResolutions: [1080, 720, 480],
          audioBitrates: [128, 160, 192, 256]
        },
        originalUrl: url,
        platform: 'facebook',
        downloadUrls: {
          video: [fbData.hd, fbData.sd].filter(Boolean)
        }
      };
    }
  } catch (fbError) {
    console.error("Facebook API error:", fbError);
  }
  
  // Fallback if FB downloader fails
  return {
    title: "Facebook Video",
    duration: "Unknown",
    durationSeconds: 0,
    thumbnail: null,
    uploader: "Facebook",
    formats: {
      hasVideo: true,
      hasAudio: true,
    },
    qualityOptions: {
      videoResolutions: [1080, 720, 480],
      audioBitrates: [128, 160, 192, 256]
    },
    originalUrl: url,
    platform: 'facebook',
  };
}

module.exports = { getFacebookInfo };
