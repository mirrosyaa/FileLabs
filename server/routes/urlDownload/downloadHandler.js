const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const tiktokdl = require("@tobyg74/tiktok-api-dl");
const instagramGetUrl = require("instagram-url-direct");
const { getFbVideoInfo } = require("fb-downloader-scrapper");
const { detectPlatform } = require("./utils");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/url-downloads");

async function downloadMedia(url, format, downloadUrls, res) {
  let filePath = null;
  const platform = detectPlatform(url);
  console.log("Platform:", platform);

  try {
    switch (platform) {
      case 'youtube':
        await downloadYouTube(url, format, res);
        break;
        
      case 'tiktok':
        await downloadTikTok(url, format, res);
        break;
        
      case 'instagram':
        await downloadInstagram(url, res);
        break;
        
      case 'facebook':
        await downloadFacebook(url, res);
        break;
        
      case 'twitter':
        throw new Error('Twitter/X video downloads currently unavailable. Twitter requires authentication for video downloads. Please try using a direct video URL or another platform.');
        
      default:
        await downloadDirect(url, res);
    }
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.remove(filePath).catch(err => console.error('Error removing file:', err));
    }
    throw error;
  }
}

async function downloadYouTube(url, format, res) {
  fs.ensureDirSync(UPLOAD_DIR);

  const info = await ytdl.getInfo(url);
  const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '').substring(0, 50);
  
  let downloadStream;
  let filename;
  let contentType;
  let filePath;

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
}

async function downloadTikTok(url, format, res) {
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
    if (!downloadUrl) {
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
}

async function downloadInstagram(url, res) {
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
}

async function downloadFacebook(url, res) {
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
}

async function downloadDirect(url, res) {
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

module.exports = { downloadMedia };
