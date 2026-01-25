const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { detectPlatform } = require("./utils");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

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
        reject(new Error(`yt-dlp failed: ${error || "No output"}`));
      }
    });
  });
}

// Utility: Download directly with yt-dlp (fast, preserves quality and colors)
async function downloadWithYtDlp(url, format, quality, audioBitrate) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, uuidv4());

  return new Promise((resolve, reject) => {
    let outputPath = "";
    let ytDlpArgs = [];

    if (format === "audio") {
      outputPath = tmpFile + ".mp3";
      ytDlpArgs = [
        "-f",
        "bestaudio/best",
        "-x", // Extract audio
        "--audio-format",
        "mp3",
        "--audio-quality",
        audioBitrate || "192K",
        "--no-playlist",
        "--no-warnings",

        "-o",
        outputPath,
        url,
      ];
    } else if (format === "video") {
      outputPath = tmpFile + ".mp4";
      ytDlpArgs = [
        "-f",
        "bestvideo[vcodec^=avc1][dynamic_range!=HDR]/bestvideo[dynamic_range!=HDR]/bestvideo",
        "--no-audio",
        "--merge-output-format",
        "mp4",
        "--no-playlist",
        "--no-warnings",
        "-o",
        outputPath,
        url,
      ];
    } else {
      outputPath = tmpFile + ".mp4";
      ytDlpArgs = [
        "-f",
        "bestvideo[vcodec^=avc1][dynamic_range!=HDR]+bestaudio/bestvideo[dynamic_range!=HDR]+bestaudio/best",
        "--merge-output-format",
        "mp4",
        "--no-playlist",
        "--no-warnings",
        "--postprocessor-args",
        `ffmpeg:-c:v copy -c:a aac -b:a ${audioBitrate || "192"}k`,
        "-o",
        outputPath,
        url,
      ];
    }

    console.log(
      `Downloading with yt-dlp: format=${format}, quality=${quality}p, audio=${audioBitrate}k`,
    );

    const ytDlp = spawn("yt-dlp", ytDlpArgs);

    ytDlp.stdout.on("data", (data) => console.log(data.toString()));
    ytDlp.stderr.on("data", (data) => console.log(data.toString()));

    ytDlp.on("close", (code) => {
      if (
        code === 0 &&
        fs.existsSync(outputPath) &&
        fs.statSync(outputPath).size > 0
      ) {
        console.log(`Download complete: ${outputPath}`);
        resolve(outputPath);
      } else {
        reject(new Error(`yt-dlp failed with code ${code}`));
      }
    });
  });
}

async function downloadMedia(url, format, options, res) {
  const platform = detectPlatform(url);
  const { quality, audioBitrate } = options || {};

  console.log("Platform:", platform);
  console.log(
    "Format:",
    format,
    "Quality:",
    quality,
    "Audio Bitrate:",
    audioBitrate,
  );

  let tmpFile = null;

  try {
    const fileExt = format === "audio" ? ".mp3" : ".mp4";
    const filename = `${platform}-${format}${fileExt}`;
    const contentType = format === "audio" ? "audio/mpeg" : "video/mp4";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);

    // Download with yt-dlp
    const videoQuality = quality || "1080";
    const audioBitrateValue = audioBitrate || "192";

    tmpFile = await downloadWithYtDlp(
      url,
      format,
      videoQuality,
      audioBitrateValue,
    );

    console.log("Downloaded to:", tmpFile);

    // Check file size
    const stat = fs.statSync(tmpFile);
    console.log("File size:", stat.size, "bytes");

    if (stat.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    // Stream the downloaded file directly without re-encoding
    // Re-encoding causes streaming issues
    res.setHeader("Content-Length", stat.size);

    const readStream = fs.createReadStream(tmpFile);

    readStream.on("end", () => {
      console.log("Stream ended, cleaning up");
      if (tmpFile && fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });

    readStream.on("error", (err) => {
      console.error("Stream error:", err);
      if (tmpFile && fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });

    readStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);

    // Cleanup on error
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to download media",
        details: error.message,
      });
    }
  }
}

module.exports = { downloadMedia, getVideoFormats };
