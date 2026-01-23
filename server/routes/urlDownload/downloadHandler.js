const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { detectPlatform } = require("./utils");

// Utility: Get video info using yt-dlp
async function getVideoFormats(url) {
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
          resolve(info);
        } catch (e) {
          reject(new Error("Failed to parse yt-dlp output"));
        }
      } else {
        reject(new Error(`yt-dlp failed: ${error || 'No output'}`));
      }
    });
  });
}

// Utility: Download using yt-dlp and get file path
async function downloadWithYtDlp(url, format, quality, audioBitrate) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, uuidv4());
  
  return new Promise((resolve, reject) => {
    let ytDlpArgs = [];
    let expectedExt = '';
    
    if (format === 'audio') {
      // Audio only - download best audio and convert to MP3 with specified bitrate
      const bitrate = audioBitrate || '192';
      expectedExt = '.mp3';
      ytDlpArgs = [
        url,
        "-f", "bestaudio/best",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", bitrate + "K",
        "--no-playlist",
        "-o", tmpFile + expectedExt
      ];
    } else if (format === 'video') {
      // Video only - no audio
      expectedExt = '.mp4';
      ytDlpArgs = [
        url,
        "-f", `bestvideo[height<=${quality}][ext=mp4]/bestvideo[height<=${quality}]/bestvideo/best`,
        "--no-playlist",
        "-o", tmpFile + expectedExt
      ];
    } else {
      // Video + Audio - merge best video and audio
      expectedExt = '.mp4';
      ytDlpArgs = [
        url,
        "-f", `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`,
        "--merge-output-format", "mp4",
        "--no-playlist",
        "-o", tmpFile + expectedExt
      ];
    }
    
    console.log("Running yt-dlp:", "yt-dlp", ytDlpArgs.join(" "));
    
    const ytDlp = spawn("yt-dlp", ytDlpArgs);
    let stderrOutput = "";
    
    ytDlp.stdout.on("data", (data) => {
      process.stdout.write(data);
    });
    
    ytDlp.stderr.on("data", (data) => {
      stderrOutput += data.toString();
      process.stderr.write(data);
    });
    
    ytDlp.on("close", (code) => {
      const finalPath = tmpFile + expectedExt;
      
      if (code === 0 && fs.existsSync(finalPath)) {
        const stats = fs.statSync(finalPath);
        if (stats.size > 0) {
          console.log(`Download successful: ${finalPath} (${stats.size} bytes)`);
          resolve(finalPath);
        } else {
          reject(new Error("Downloaded file is empty"));
        }
      } else {
        reject(new Error(`yt-dlp failed with code ${code}: ${stderrOutput || 'Unknown error'}`));
      }
    });
    
    ytDlp.on("error", (err) => {
      reject(new Error(`Failed to spawn yt-dlp: ${err.message}`));
    });
  });
}

// Utility: Download from direct URL (for TikTok, Instagram, Facebook)
async function downloadFromDirectUrl(directUrl, format) {
  const https = require('https');
  const http = require('http');
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, uuidv4() + (format === 'audio' ? '.mp3' : '.mp4'));
  
  return new Promise((resolve, reject) => {
    const protocol = directUrl.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(tmpFile);
    
    protocol.get(directUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(tmpFile);
        return downloadFromDirectUrl(response.headers.location, format)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(tmpFile);
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(tmpFile);
          if (stats.size > 0) {
            console.log(`Direct download successful: ${tmpFile} (${stats.size} bytes)`);
            resolve(tmpFile);
          } else {
            fs.unlinkSync(tmpFile);
            reject(new Error("Downloaded file is empty"));
          }
        });
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
      reject(err);
    });
  });
}

async function downloadMedia(url, format, options, res) {
  const platform = detectPlatform(url);
  const { quality, audioBitrate, directUrl } = options || {};
  
  console.log("Platform:", platform);
  console.log("Format:", format, "Quality:", quality, "Audio Bitrate:", audioBitrate);
  console.log("Direct URL:", directUrl);
  
  let tmpFile = null;
  
  try {
    const fileExt = format === 'audio' ? '.mp3' : '.mp4';
    const filename = `${platform}-${format}${fileExt}`;
    const contentType = format === 'audio' ? 'audio/mpeg' : 'video/mp4';
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    
    // Use direct URL if available (for TikTok, Instagram, Facebook)
    if (directUrl) {
      console.log("Using direct download from:", directUrl);
      tmpFile = await downloadFromDirectUrl(directUrl, format);
    } else {
      // Download with yt-dlp (for YouTube, Twitter, etc.)
      const videoQuality = quality || '1080';
      const audioBitrateValue = audioBitrate || '192';
      
      tmpFile = await downloadWithYtDlp(url, format, videoQuality, audioBitrateValue);
    }
    
    console.log("Downloaded to:", tmpFile);
    
    // Check file size
    const stat = fs.statSync(tmpFile);
    console.log("File size:", stat.size, "bytes");
    
    if (stat.size === 0) {
      throw new Error("Downloaded file is empty");
    }
    
    // Stream the downloaded file directly without re-encoding
    // Re-encoding causes streaming issues
    res.setHeader('Content-Length', stat.size);
    
    const readStream = fs.createReadStream(tmpFile);
    
    readStream.on('end', () => {
      console.log("Stream ended, cleaning up");
      if (tmpFile && fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });
    
    readStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (tmpFile && fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });
    
    readStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    
    // Cleanup on error
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to download media', 
        details: error.message 
      });
    }
  }
}

module.exports = { downloadMedia, getVideoFormats };
