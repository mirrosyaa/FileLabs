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
        reject(new Error(`yt-dlp failed: ${error || 'No output'}`));
      }
    });
  });
}

// Utility: Download using yt-dlp to get URLs and ffmpeg to process
async function downloadWithFfmpeg(url, format, quality, audioBitrate) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, uuidv4());
  
  return new Promise(async (resolve, reject) => {
    try {
      let expectedExt = '';
      let outputPath = '';
      
      if (format === 'audio') {
        // Audio only - use yt-dlp to get URL and ffmpeg to download/convert
        expectedExt = '.mp3';
        outputPath = tmpFile + expectedExt;
        const bitrate = audioBitrate || '192';
        
        console.log(`Downloading audio with ffmpeg: bitrate=${bitrate}k`);
        
        // Get best audio URL using yt-dlp
        const ytDlp = spawn("yt-dlp", [
          "-f", "bestaudio/best",
          "--get-url",
          "--no-playlist",
          url
        ]);
        
        let audioUrl = "";
        let error = "";
        
        ytDlp.stdout.on("data", (data) => {
          audioUrl += data.toString().trim();
        });
        
        ytDlp.stderr.on("data", (data) => {
          error += data.toString();
        });
        
        ytDlp.on("close", (code) => {
          if (code === 0 && audioUrl) {
            console.log("Got audio URL, processing with ffmpeg...");
            
            // Use ffmpeg to download and convert to MP3
            ffmpeg(audioUrl)
              .audioCodec('libmp3lame')
              .audioBitrate(bitrate)
              .format('mp3')
              .on('start', (cmd) => {
                console.log('FFmpeg command:', cmd);
              })
              .on('progress', (progress) => {
                if (progress.percent) {
                  console.log(`Processing: ${Math.round(progress.percent)}%`);
                }
              })
              .on('end', () => {
                console.log(`Audio download complete: ${outputPath}`);
                if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                  resolve(outputPath);
                } else {
                  reject(new Error("Downloaded audio file is empty or doesn't exist"));
                }
              })
              .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(new Error(`FFmpeg failed: ${err.message}`));
              })
              .save(outputPath);
          } else {
            reject(new Error(`yt-dlp failed to get audio URL: ${error || 'Unknown error'}`));
          }
        });
        
      } else if (format === 'video') {
        // Video only (no audio) - use yt-dlp to get URL and ffmpeg to download
        expectedExt = '.mp4';
        outputPath = tmpFile + expectedExt;
        
        console.log(`Downloading video only with ffmpeg: quality=${quality}p`);
        
        // Get video URL using yt-dlp
        const ytDlp = spawn("yt-dlp", [
          "-f", `bestvideo[height<=${quality}][ext=mp4]/bestvideo[height<=${quality}]/bestvideo`,
          "--get-url",
          "--no-playlist",
          url
        ]);
        
        let videoUrl = "";
        let error = "";
        
        ytDlp.stdout.on("data", (data) => {
          videoUrl += data.toString().trim();
        });
        
        ytDlp.stderr.on("data", (data) => {
          error += data.toString();
        });
        
        ytDlp.on("close", (code) => {
          if (code === 0 && videoUrl) {
            console.log("Got video URL, processing with ffmpeg...");
            
            // Use ffmpeg to download video
            ffmpeg(videoUrl)
              .videoCodec('copy')
              .noAudio()
              .format('mp4')
              .on('start', (cmd) => {
                console.log('FFmpeg command:', cmd);
              })
              .on('progress', (progress) => {
                if (progress.percent) {
                  console.log(`Processing: ${Math.round(progress.percent)}%`);
                }
              })
              .on('end', () => {
                console.log(`Video download complete: ${outputPath}`);
                if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                  resolve(outputPath);
                } else {
                  reject(new Error("Downloaded video file is empty or doesn't exist"));
                }
              })
              .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(new Error(`FFmpeg failed: ${err.message}`));
              })
              .save(outputPath);
          } else {
            reject(new Error(`yt-dlp failed to get video URL: ${error || 'Unknown error'}`));
          }
        });
        
      } else {
        // Video + Audio - use yt-dlp to get URLs and ffmpeg to merge
        expectedExt = '.mp4';
        outputPath = tmpFile + expectedExt;
        
        console.log(`Downloading video+audio with ffmpeg: quality=${quality}p`);
        
        // Get both video and audio URLs using yt-dlp
        const ytDlp = spawn("yt-dlp", [
          "-f", `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`,
          "--get-url",
          "--no-playlist",
          url
        ]);
        
        let urls = "";
        let error = "";
        
        ytDlp.stdout.on("data", (data) => {
          urls += data.toString();
        });
        
        ytDlp.stderr.on("data", (data) => {
          error += data.toString();
        });
        
        ytDlp.on("close", (code) => {
          if (code === 0 && urls) {
            const urlList = urls.trim().split('\n');
            
            if (urlList.length === 2) {
              // Two URLs: video and audio
              const videoUrl = urlList[0];
              const audioUrl = urlList[1];
              
              console.log('Merging video and audio streams with ffmpeg');
              
              ffmpeg()
                .input(videoUrl)
                .input(audioUrl)
                .videoCodec('copy')
                .audioCodec('aac')
                .audioBitrate('192k')
                .outputOptions(['-movflags', '+faststart'])
                .format('mp4')
                .on('start', (cmd) => {
                  console.log('FFmpeg command:', cmd);
                })
                .on('progress', (progress) => {
                  if (progress.percent) {
                    console.log(`Processing: ${Math.round(progress.percent)}%`);
                  }
                })
                .on('end', () => {
                  console.log(`Video+Audio merge complete: ${outputPath}`);
                  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                    resolve(outputPath);
                  } else {
                    reject(new Error("Merged file is empty or doesn't exist"));
                  }
                })
                .on('error', (err) => {
                  console.error('FFmpeg merge error:', err);
                  reject(new Error(`FFmpeg merge failed: ${err.message}`));
                })
                .save(outputPath);
                
            } else if (urlList.length === 1) {
              // Single URL: already merged or best quality available
              const mediaUrl = urlList[0];
              
              console.log('Downloading single stream with ffmpeg');
              
              ffmpeg(mediaUrl)
                .videoCodec('copy')
                .audioCodec('copy')
                .outputOptions(['-movflags', '+faststart'])
                .format('mp4')
                .on('start', (cmd) => {
                  console.log('FFmpeg command:', cmd);
                })
                .on('progress', (progress) => {
                  if (progress.percent) {
                    console.log(`Processing: ${Math.round(progress.percent)}%`);
                  }
                })
                .on('end', () => {
                  console.log(`Video download complete: ${outputPath}`);
                  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                    resolve(outputPath);
                  } else {
                    reject(new Error("Downloaded file is empty or doesn't exist"));
                  }
                })
                .on('error', (err) => {
                  console.error('FFmpeg error:', err);
                  reject(new Error(`FFmpeg failed: ${err.message}`));
                })
                .save(outputPath);
            } else {
              reject(new Error("Unexpected number of URLs from yt-dlp"));
            }
          } else {
            reject(new Error(`yt-dlp failed to get media URLs: ${error || 'Unknown error'}`));
          }
        });
      }
      
    } catch (error) {
      reject(error);
    }
  });
}

async function downloadMedia(url, format, options, res) {
  const platform = detectPlatform(url);
  const { quality, audioBitrate } = options || {};
  
  console.log("Platform:", platform);
  console.log("Format:", format, "Quality:", quality, "Audio Bitrate:", audioBitrate);
  
  let tmpFile = null;
  
  try {
    const fileExt = format === 'audio' ? '.mp3' : '.mp4';
    const filename = `${platform}-${format}${fileExt}`;
    const contentType = format === 'audio' ? 'audio/mpeg' : 'video/mp4';
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    
    // Download with yt-dlp and ffmpeg
    const videoQuality = quality || '1080';
    const audioBitrateValue = audioBitrate || '192';
    
    tmpFile = await downloadWithFfmpeg(url, format, videoQuality, audioBitrateValue);
    
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
