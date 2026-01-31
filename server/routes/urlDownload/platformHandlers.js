const { spawn } = require("child_process");
const { getFbVideoInfo } = require("fb-downloader-scrapper");
const { instagramGetUrl } = require("instagram-url-direct");
const tiktokdl = require("@tobyg74/tiktok-api-dl");
const { formatDuration } = require("./utils");

// ============= YOUTUBE HANDLER =============
async function getYouTubeInfo(url) {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn("yt-dlp", ["-J", url]);
    let output = "";
    let error = "";

    ytDlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytDlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    ytDlp.on("close", (code) => {
      if (code === 0 && output.trim()) {
        try {
          const info = JSON.parse(output);

          // Get available video resolutions from formats
          const videoFormats =
            info.formats?.filter(
              (f) => f.vcodec && f.vcodec !== "none" && f.height,
            ) || [];
          const resolutions = [
            ...new Set(videoFormats.map((f) => f.height).filter(Boolean)),
          ];
          resolutions.sort((a, b) => b - a); // Sort descending

          // Get available audio bitrates
          const audioFormats =
            info.formats?.filter(
              (f) => f.acodec && f.acodec !== "none" && f.abr,
            ) || [];
          const audioBitrates = [
            ...new Set(
              audioFormats.map((f) => Math.round(f.abr)).filter(Boolean),
            ),
          ];
          audioBitrates.sort((a, b) => b - a); // Sort descending

          // Limit audio bitrates to max 320
          const limitedAudioBitrates = audioBitrates
            .filter((b) => b <= 320)
            .slice(0, 4);
          if (limitedAudioBitrates.length === 0)
            limitedAudioBitrates.push(128, 160, 192, 256, 320);

          resolve({
            title: info.title || "Unknown Title",
            duration: formatDuration(info.duration || 0),
            durationSeconds: info.duration || 0,
            thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || null,
            uploader: info.uploader || info.channel || "Unknown",
            formats: {
              hasVideo: videoFormats.length > 0,
              hasAudio: audioFormats.length > 0,
            },
            qualityOptions: {
              videoResolutions:
                resolutions.length > 0
                  ? resolutions
                  : [2160, 1440, 1080, 720, 480, 360],
              audioBitrates:
                limitedAudioBitrates.length > 0
                  ? limitedAudioBitrates
                  : [128, 160, 192, 256, 320],
            },
            originalUrl: url,
            platform: "youtube",
          });
        } catch (e) {
          reject(new Error("Failed to parse yt-dlp output: " + e.message));
        }
      } else {
        reject(new Error(`yt-dlp failed: ${error || "No output"}`));
      }
    });
  });
}

// ============= TIKTOK HANDLER =============
async function getTikTokInfo(url) {
  const result = await tiktokdl.Downloader(url, {
    version: "v3"
  });
  
  console.log("TikTok API Response:", JSON.stringify(result, null, 2));
  
  if (result.status === 'success' && result.result) {
    const data = result.result;
    
    // Extract download URLs - TikTok API returns videoHD, videoSD, videoWatermark
    let videoUrls = [];
    let musicUrls = [];
    
    // Prefer HD video, fallback to SD, then watermarked
    if (data.videoHD) videoUrls.push(data.videoHD);
    if (data.videoSD) videoUrls.push(data.videoSD);
    if (data.videoWatermark) videoUrls.push(data.videoWatermark);
    
    // Try to extract music/audio URLs
    if (data.music) {
      if (Array.isArray(data.music)) {
        musicUrls = data.music;
      } else if (typeof data.music === 'string') {
        musicUrls = [data.music];
      } else if (data.music.play_url) {
        musicUrls = [data.music.play_url];
      }
    }
    
    return {
      title: data.title || data.desc || "TikTok Video",
      duration: formatDuration(data.duration || 0),
      durationSeconds: data.duration || 0,
      thumbnail: data.cover || data.dynamic_cover || data.origin_cover || data.author?.avatar || null,
      uploader: data.author?.nickname || data.author?.unique_id || "TikTok User",
      formats: {
        hasVideo: true,
        hasAudio: true,
      },
      qualityOptions: {
        videoResolutions: [1080, 720, 480],
        audioBitrates: [128, 160, 192, 256]
      },
      originalUrl: url,
      platform: 'tiktok',
      downloadUrls: {
        video: videoUrls,
        music: musicUrls
      }
    };
  } else {
    throw new Error('Failed to fetch TikTok video information');
  }
}

// ============= INSTAGRAM HANDLER =============
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

// ============= FACEBOOK HANDLER =============
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

module.exports = { 
  getYouTubeInfo, 
  getTikTokInfo, 
  getInstagramInfo, 
  getFacebookInfo 
};
