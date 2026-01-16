const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const path = require("path");
const { getMediaInfo } = require("./urlDownload/infoHandler");
const { downloadMedia } = require("./urlDownload/downloadHandler");

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "../uploads/url-downloads");
fs.ensureDirSync(UPLOAD_DIR);

// Get video/audio information
router.post("/url-info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log("Fetching info for URL:", url);

    const mediaInfo = await getMediaInfo(url);
    console.log("Media info:", mediaInfo);
    return res.json(mediaInfo);

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
  try {
    const { url, format, downloadUrls } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!format) {
      return res.status(400).json({ error: "Format is required" });
    }

    console.log(`Downloading media from ${url} with format: ${format}`);

    await downloadMedia(url, format, downloadUrls, res);

  } catch (error) {
    console.error("Error downloading media:", error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to download media. Please try again.",
        details: error.message 
      });
    }
  }
});

module.exports = router;
