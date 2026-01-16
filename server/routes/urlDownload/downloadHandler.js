const { spawn } = require("child_process");
const axios = require("axios");
const path = require("path");
const { detectPlatform } = require("./utils");
const ffmpeg = require("fluent-ffmpeg");


// Utility: Extract direct video URL using yt-dlp
async function extractDirectUrlWithYtDlp(url) {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn("yt-dlp", [
      "-f", "best[ext=mp4]/best",
      "-g", // get direct URL
      url
    ]);
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
        resolve(output.trim().split("\n")[0]);
      } else {
        reject(new Error(`yt-dlp failed: ${error || 'No output'}`));
      }
    });
  });
}


const fs = require("fs");
const os = require("os");
const { v4: uuidv4 } = require("uuid");

async function downloadMedia(url, format, downloadUrls, res) {
  const platform = detectPlatform(url);
  console.log("Platform:", platform);
  try {
    let filename = `${platform}-video.mp4`;
    let contentType = 'video/mp4';
    if (format === 'audio') {
      filename = `${platform}-audio.mp3`;
      contentType = 'audio/mpeg';
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);

    // For Instagram, TikTok, Facebook, Twitter, use yt-dlp to download to temp file, then stream
    if (["instagram", "tiktok", "facebook", "twitter"].includes(platform)) {
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, uuidv4() + (format === 'audio' ? '.mp3' : '.mp4'));
      let ytDlpArgs = [url, "-o", tmpFile];
      if (format === 'audio') {
        ytDlpArgs = [url, "-x", "--audio-format", "mp3", "-o", tmpFile];
      }
      await new Promise((resolve, reject) => {
        const ytDlp = spawn("yt-dlp", ytDlpArgs);
        ytDlp.stderr.on("data", (data) => {
          process.stderr.write(data);
        });
        ytDlp.on("close", (code) => {
          if (code === 0 && fs.existsSync(tmpFile)) {
            resolve();
          } else {
            reject(new Error("yt-dlp failed to download file"));
          }
        });
      });
      const readStream = fs.createReadStream(tmpFile);
      readStream.pipe(res);
      readStream.on('close', () => {
        fs.unlink(tmpFile, () => {});
      });
    } else {
      // For YouTube or direct, use previous ffmpeg logic
      const directUrl = await extractDirectUrlWithYtDlp(url);
      if (!directUrl) throw new Error('Failed to extract direct video URL.');
      if (format === 'audio') {
        ffmpeg(directUrl)
          .format('mp3')
          .audioCodec('libmp3lame')
          .on('error', (err) => {
            console.error('ffmpeg error:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Error extracting audio' });
            }
          })
          .pipe(res, { end: true });
      } else {
        ffmpeg(directUrl)
          .format('mp4')
          .on('error', (err) => {
            console.error('ffmpeg error:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Error downloading video' });
            }
          })
          .pipe(res, { end: true });
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download media', details: error.message });
    }
  }
}

module.exports = { downloadMedia };
module.exports = { downloadMedia };
