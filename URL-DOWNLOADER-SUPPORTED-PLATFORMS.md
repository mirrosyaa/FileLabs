# URL Downloader - Supported Platforms

The URL Downloader feature now supports downloading videos from multiple social media platforms and websites.

## ✅ Supported Platforms

### 1. **YouTube**
- Full support for video + audio, video only, and audio only downloads
- Shows video thumbnail, title, duration, and uploader
- Supports all YouTube URL formats (youtube.com, youtu.be)

### 2. **TikTok**
- Download TikTok videos with audio
- Supports regular TikTok posts, reels, and videos
- Works with both app links and web links
- Shows video thumbnail and creator information

### 3. **Instagram**
- Download Instagram videos and reels
- Supports both posts and reels
- Works with instagram.com URLs

### 4. **Facebook**
- Download Facebook videos
- Supports facebook.com and fb.watch links
- Works with public video posts

### 5. **Twitter/X**
- Download videos from Twitter/X posts
- Supports both twitter.com and x.com URLs
- Works with video tweets

### 6. **Direct URLs**
- Any direct file download link
- Works with .mp4, .mp3, .webm, and other video/audio formats

## 🎯 Features

- **Format Selection**: For YouTube, choose between:
  - Video + Audio (MP4)
  - Video Only (no audio)
  - Audio Only (MP3)

- **Media Preview**: Shows thumbnail, title, duration (when available), and uploader information

- **Progress Tracking**: Real-time download progress indication

- **Auto-Detection**: Automatically detects the platform and uses the appropriate download method

## 📝 How to Use

1. Go to "Download from URL" tool
2. Paste any supported URL
3. Click "Continue"
4. Preview the media information
5. Select format (for YouTube) or click "Download File" (for other platforms)
6. Download starts automatically

## 🔧 Technical Details

**Backend Packages:**
- `@distube/ytdl-core` - YouTube downloads
- `@tobyg74/tiktok-api-dl` - TikTok downloads
- `instagram-url-direct` - Instagram downloads
- `axios` - Direct file downloads and fallback method

**API Endpoints:**
- `POST /api/url-info` - Fetch media information
- `POST /api/download-media` - Download the media file

## ⚠️ Notes

- Some platforms may have restrictions on downloadable content
- Private or age-restricted videos may not be downloadable
- Download quality depends on source availability
- For best results, use public URLs
