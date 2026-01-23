const { getFbVideoInfo } = require("fb-downloader-scrapper");

async function getFacebookInfo(url) {
  try {
    console.log("Calling Facebook downloader for:", url);
    
    const fbData = await getFbVideoInfo(url);
    
    console.log("Facebook API Response:", JSON.stringify(fbData, null, 2));
    
    if (fbData && (fbData.hd || fbData.sd)) {
      // Try to extract thumbnail from various possible properties
      let thumbnail = null;
      const possibleThumbProps = ['thumbnail', 'thumb', 'picture', 'image', 'cover'];
      
      for (const prop of possibleThumbProps) {
        if (fbData[prop] && typeof fbData[prop] === 'string' && fbData[prop].startsWith('http')) {
          thumbnail = fbData[prop];
          break;
        }
      }
      
      // Fallback to video URL if no thumbnail found
      if (!thumbnail && (fbData.hd || fbData.sd)) {
        thumbnail = fbData.hd || fbData.sd;
      }
      
      console.log("Facebook thumbnail:", thumbnail);
      
      return {
        title: fbData.title || "Facebook Video",
        duration: "Unknown",
        durationSeconds: 0,
        thumbnail: thumbnail,
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
