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


async function downloadMedia(url, format, downloadUrls, res) {
  const platform = detectPlatform(url);
  console.log("Platform:", platform);
  try {
    // Use yt-dlp to extract direct video URL
    const directUrl = await extractDirectUrlWithYtDlp(url);
    if (!directUrl) throw new Error('Failed to extract direct video URL.');

    let filename = `${platform}-video.mp4`;
    let contentType = 'video/mp4';
    if (format === 'audio') {
      filename = `${platform}-audio.mp3`;
      contentType = 'audio/mpeg';
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);

    if (format === 'audio') {
      // Use ffmpeg to extract audio from video URL
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
      // Use ffmpeg to download/process video (can also just stream directUrl if you want raw video)
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
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download media', details: error.message });
    }
  }
}

module.exports = { downloadMedia };
module.exports = { downloadMedia };
