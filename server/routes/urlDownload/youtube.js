const { spawn } = require("child_process");
const { formatDuration } = require("./utils");

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

module.exports = { getYouTubeInfo };
