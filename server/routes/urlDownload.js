const express = require("express");
const router = express.Router();
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "../uploads/url-downloads");
fs.ensureDirSync(UPLOAD_DIR);

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

    // Validate if it's a YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ 
        error: "Invalid YouTube URL. Please provide a valid YouTube video link." 
      });
    }

    // Get video information using ytdl-core
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    const videoInfo = {
      title: videoDetails.title || "Unknown Title",
      duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
      durationSeconds: parseInt(videoDetails.lengthSeconds) || 0,
      thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || null,
      uploader: videoDetails.author?.name || videoDetails.ownerChannelName || "Unknown",
      formats: {
        hasVideo: true,
        hasAudio: true,
      },
      originalUrl: url,
    };

    console.log("Video info:", videoInfo);
    res.json(videoInfo);
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
    const { url, format } = req.body;
    // format can be: 'video+audio', 'video', 'audio'

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!format) {
      return res.status(400).json({ error: "Format is required" });
    }

    console.log(`Downloading media from ${url} with format: ${format}`);

    // Validate if it's a YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ 
        error: "Invalid YouTube URL. Please provide a valid YouTube video link." 
      });
    }

    // Ensure output directory exists
    fs.ensureDirSync(UPLOAD_DIR);

    // Get video info
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '').substring(0, 50);
    
    let downloadStream;
    let filename;
    let contentType;

    if (format === 'audio') {
      // Audio only
      downloadStream = ytdl(url, { 
        quality: 'highestaudio',
        filter: 'audioonly'
      });
      filename = `${videoTitle}-audio.mp3`;
      contentType = 'audio/mpeg';
      filePath = path.join(UPLOAD_DIR, `${Date.now()}-audio.mp3`);
    } else if (format === 'video') {
      // Video only (no audio)
      downloadStream = ytdl(url, { 
        quality: 'highestvideo',
        filter: 'videoonly'
      });
      filename = `${videoTitle}-video.mp4`;
      contentType = 'video/mp4';
      filePath = path.join(UPLOAD_DIR, `${Date.now()}-video.mp4`);
    } else {
      // Video + Audio (default)
      downloadStream = ytdl(url, { 
        quality: 'highestvideo',
        filter: format => format.hasVideo && format.hasAudio
      });
      filename = `${videoTitle}.mp4`;
      contentType = 'video/mp4';
      filePath = path.join(UPLOAD_DIR, `${Date.now()}.mp4`);
    }

    // Save to file first
    const writeStream = fs.createWriteStream(filePath);
    
    await new Promise((resolve, reject) => {
      downloadStream.pipe(writeStream);
      downloadStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', resolve);
    });

    console.log('Download completed, sending file...');

    // Get file stats
    const stats = fs.statSync(filePath);

    // Send file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    // Cleanup after sending
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

  } catch (error) {
    console.error("Error downloading media:", error);
    
    // Cleanup on error
    if (filePath && fs.existsSync(filePath)) {
      fs.remove(filePath).catch(err => console.error('Error removing file:', err));
    }
    
    res.status(500).json({ 
      error: "Failed to download media. Please try again.",
      details: error.message 
    });
  }
});

module.exports = router;
