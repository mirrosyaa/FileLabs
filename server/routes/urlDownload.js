const express = require("express");
const router = express.Router();
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const tiktokdl = require("@tobyg74/tiktok-api-dl");
const instagramGetUrl = require("instagram-url-direct");
const { getFbVideoInfo } = require("fb-downloader-scrapper");

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "../uploads/url-downloads");
fs.ensureDirSync(UPLOAD_DIR);

// Helper function to detect platform
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  
  if (ytdl.validateURL(url)) return 'youtube';
  if (urlLower.includes('tiktok.com')) return 'tiktok';
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch') || urlLower.includes('fb.com')) return 'facebook';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  
  return 'direct';
}

// Helper function to format duration
function formatDuration(seconds) {
  if (!seconds) return "Unknown";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get video/audio information
router.post("/url-info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log("Fetching info for URL:", url);

    const platform = detectPlatform(url);
    console.log("Detected platform:", platform);

    if (platform === 'youtube') {
      // YouTube
      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;

      // Get a low-quality video URL for preview
      const previewFormat = info.formats.find(format => 
        format.hasVideo && format.hasAudio && 
        (format.qualityLabel === '360p' || format.qualityLabel === '240p' || format.qualityLabel === '144p')
      ) || info.formats.find(format => format.hasVideo && format.hasAudio);

      const videoInfo = {
        title: videoDetails.title || "Unknown Title",
        duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
        durationSeconds: parseInt(videoDetails.lengthSeconds) || 0,
        thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || null,
        previewUrl: previewFormat?.url || null,
        uploader: videoDetails.author?.name || videoDetails.ownerChannelName || "Unknown",
        formats: {
          hasVideo: true,
          hasAudio: true,
        },
        originalUrl: url,
        platform: 'youtube',
      };

      console.log("YouTube video info:", videoInfo);
      return res.json(videoInfo);
      
    } else if (platform === 'tiktok') {
      // TikTok
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
        
        const videoInfo = {
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
        
        console.log("TikTok video info:", videoInfo);
        return res.json(videoInfo);
      } else {
        throw new Error('Failed to fetch TikTok video information');
      }
      
    } else if (platform === 'instagram') {
      // Instagram
      const links = await instagramGetUrl(url);
      
      const videoInfo = {
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
      
      console.log("Instagram video info:", videoInfo);
      return res.json(videoInfo);
      
    } else if (platform === 'facebook') {
      // Facebook
      try {
        console.log("Calling Facebook downloader for:", url);
        
        const fbData = await getFbVideoInfo(url);
        
        console.log("Facebook API response:", fbData);
        
        if (fbData && (fbData.hd || fbData.sd)) {
          const videoInfo = {
            title: fbData.title || "Facebook Video",
            duration: "Unknown",
            durationSeconds: 0,
            thumbnail: null,
            previewUrl: fbData.sd || fbData.hd || null,
            uploader: "Facebook",
            formats: {
              hasVideo: true,
              hasAudio: true,
            },
            originalUrl: url,
            platform: 'facebook',
            downloadUrls: {
              video: [fbData.hd, fbData.sd].filter(Boolean)
            }
          };
          
          console.log("Facebook video info:", videoInfo);
          return res.json(videoInfo);
        }
      } catch (fbError) {
        console.error("Facebook API error:", fbError);
      }
      
      // Fallback if FB downloader fails
      const videoInfo = {
        title: "Facebook Video",
        duration: "Unknown",
        durationSeconds: 0,
        thumbnail: null,
        uploader: "Facebook",
        formats: {
          hasVideo: true,
          hasAudio: true,
        },
        originalUrl: url,
        platform: 'facebook',
      };
      
      console.log("Facebook video info (fallback):", videoInfo);
      return res.json(videoInfo);
      
    } else if (platform === 'twitter') {
      // Twitter/X - Basic support
      const videoInfo = {
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
      
      console.log("Twitter video info:", videoInfo);
      return res.json(videoInfo);
      
    } else {
      // Direct URL
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop() || 'download';
      
      const videoInfo = {
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

      console.log("Direct file info:", videoInfo);
      return res.json(videoInfo);
    }
  } catch (error) {
    console.error("Error fetching video info:", error);
    res.status(500).json({ 
      error: "Failed to fetch media information. Please check the URL and try again.",
      details: error.message 
    });
  }
});

// Download video/audio with format selection
router.post("/download-media", async (req, res) => {
  let filePath = null;
  
  try {
    const { url, format, downloadUrls } = req.body;
    // format can be: 'video+audio', 'video', 'audio'

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!format) {
      return res.status(400).json({ error: "Format is required" });
    }

    console.log(`Downloading media from ${url} with format: ${format}`);

    const platform = detectPlatform(url);
    console.log("Platform:", platform);

    if (platform === 'youtube') {
      // YouTube download with ytdl-core
      fs.ensureDirSync(UPLOAD_DIR);

      const info = await ytdl.getInfo(url);
      const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '').substring(0, 50);
      
      let downloadStream;
      let filename;
      let contentType;

      if (format === 'audio') {
        downloadStream = ytdl(url, { 
          quality: 'highestaudio',
          filter: 'audioonly'
        });
        filename = `${videoTitle}-audio.mp3`;
        contentType = 'audio/mpeg';
        filePath = path.join(UPLOAD_DIR, `${Date.now()}-audio.mp3`);
      } else if (format === 'video') {
        downloadStream = ytdl(url, { 
          quality: 'highestvideo',
          filter: 'videoonly'
        });
        filename = `${videoTitle}-video.mp4`;
        contentType = 'video/mp4';
        filePath = path.join(UPLOAD_DIR, `${Date.now()}-video.mp4`);
      } else {
        downloadStream = ytdl(url, { 
          quality: 'highestvideo',
          filter: format => format.hasVideo && format.hasAudio
        });
        filename = `${videoTitle}.mp4`;
        contentType = 'video/mp4';
        filePath = path.join(UPLOAD_DIR, `${Date.now()}.mp4`);
      }

      const writeStream = fs.createWriteStream(filePath);
      
      await new Promise((resolve, reject) => {
        downloadStream.pipe(writeStream);
        downloadStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
      });

      console.log('YouTube download completed, sending file...');

      const stats = fs.statSync(filePath);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);

      readStream.on('end', () => {
        console.log('File sent successfully, cleaning up...');
        setTimeout(() => {
          fs.remove(filePath).catch(err => console.error('Error removing file:', err));
        }, 1000);
      });

      readStream.on('error', (error) => {
        console.error('Stream error:', error);
        fs.remove(filePath).catch(err => console.error('Error removing file:', err));
      });
      
    } else if (platform === 'tiktok') {
      // TikTok download
      const result = await tiktokdl.Downloader(url, {
        version: "v3"
      });
      
      console.log("TikTok Download API Response:", JSON.stringify(result, null, 2));
      
      if (result.status === 'success' && result.result) {
        const data = result.result;
        let downloadUrl;
        
        // Extract download URL based on format
        if (format === 'audio') {
          // Try to get audio/music URL
          if (data.music) {
            if (typeof data.music === 'string') {
              downloadUrl = data.music;
            } else if (Array.isArray(data.music) && data.music.length > 0) {
              downloadUrl = data.music[0];
            } else if (data.music.play_url) {
              downloadUrl = data.music.play_url;
            }
          }
        }
        
        // If no audio URL or requesting video, get video URL
        // TikTok API returns videoHD, videoSD, videoWatermark
        if (!downloadUrl) {
          // Prefer HD, fallback to SD, then watermarked
          downloadUrl = data.videoHD || data.videoSD || data.videoWatermark;
        }
        
        console.log("TikTok Download URL:", downloadUrl);
        
        if (!downloadUrl) {
          throw new Error('No download URL available from TikTok API');
        }
        
        // Download the file
        const response = await axios({
          method: 'GET',
          url: downloadUrl,
          responseType: 'stream',
          maxRedirects: 5,
          timeout: 300000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.tiktok.com/'
          }
        });

        const filename = format === 'audio' ? 'tiktok-audio.mp3' : 'tiktok-video.mp4';
        const contentType = format === 'audio' ? 'audio/mpeg' : 'video/mp4';

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        
        if (response.headers['content-length']) {
          res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);

        response.data.on('error', (error) => {
          console.error('TikTok stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error downloading TikTok video' });
          }
        });
      } else {
        throw new Error('Failed to download TikTok video - API returned error');
      }
      
    } else if (platform === 'instagram') {
      // Instagram download
      const links = await instagramGetUrl(url);
      
      if (links.url_list && links.url_list.length > 0) {
        const downloadUrl = links.url_list[0];
        
        const response = await axios({
          method: 'GET',
          url: downloadUrl,
          responseType: 'stream',
          maxRedirects: 5,
          timeout: 300000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const filename = 'instagram-video.mp4';
        const contentType = 'video/mp4';

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        
        if (response.headers['content-length']) {
          res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);

        response.data.on('error', (error) => {
          console.error('Instagram stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error downloading Instagram video' });
          }
        });
      } else {
        throw new Error('No download URL available for Instagram video');
      }
      
    } else if (platform === 'facebook') {
      // Facebook download
      try {
        console.log("Downloading from Facebook:", url);
        
        const fbData = await getFbVideoInfo(url);
        
        console.log("Facebook download data:", fbData);
        
        if (fbData && (fbData.hd || fbData.sd)) {
          let downloadUrl = fbData.hd || fbData.sd;
          
          console.log("Facebook Download URL:", downloadUrl);
          
          const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            maxRedirects: 5,
            timeout: 60000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          const filename = 'facebook-video.mp4';
          const contentType = 'video/mp4';

          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', contentType);
          
          if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
          }

          response.data.pipe(res);

          response.data.on('error', (error) => {
            console.error('Facebook stream error:', error);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Error downloading Facebook video' });
            }
          });
          
          response.data.on('end', () => {
            console.log('Facebook download completed');
          });
          
          return;
        }
      } catch (fbError) {
        console.error('Facebook download error:', fbError);
        throw new Error('Failed to download Facebook video: ' + fbError.message);
      }
      
    } else if (platform === 'twitter') {
      // Twitter/X download - Note: Twitter requires API access or scraping
      // For now, inform user that Twitter downloads need special handling
      throw new Error('Twitter/X video downloads currently unavailable. Twitter requires authentication for video downloads. Please try using a direct video URL or another platform.');
      
    } else {
      // Direct file download
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        maxRedirects: 5,
        timeout: 300000,
      });

      let filename = 'download';
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        const urlPath = new URL(url).pathname;
        const urlFilename = urlPath.split('/').pop();
        if (urlFilename && urlFilename.includes('.')) {
          filename = decodeURIComponent(urlFilename);
        }
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
      
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }

      response.data.pipe(res);

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading file' });
        }
      });
    }

  } catch (error) {
    console.error("Error downloading media:", error);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.remove(filePath).catch(err => console.error('Error removing file:', err));
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to download media. Please try again.",
        details: error.message 
      });
    }
  }
});

module.exports = router;
