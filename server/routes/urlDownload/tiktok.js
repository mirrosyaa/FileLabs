const tiktokdl = require("@tobyg74/tiktok-api-dl");
const { formatDuration } = require("./utils");

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
      previewUrl: data.videoSD || data.videoWatermark || data.videoHD || null,
      uploader: data.author?.nickname || data.author?.unique_id || "TikTok User",
      formats: {
        hasVideo: true,
        hasAudio: true,
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

module.exports = { getTikTokInfo };
