const express = require("express");
const cors = require("cors");
const axios = require("axios");
const usersRoutes = require("./routes/users");
const convertRoutes = require("./routes/convert");
const compressRoutes = require("./routes/compress");
const resizeRoutes = require("./routes/resize");
const cropRoutes = require("./routes/crop");
const urlDownloadRoutes = require("./routes/urlDownload");
const pdfProcessRoutes = require("./routes/pdfProcess");
const watermarkRoutes = require("./routes/watermark");
const resolutionRoutes = require("./routes/resolution");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Routes
app.use("/users", usersRoutes);
app.use("/api", convertRoutes);
app.use("/api", compressRoutes);
app.use("/api/image/resize", resizeRoutes);
app.use("/api/image/crop", cropRoutes);
app.use("/api", urlDownloadRoutes);
app.use("/api/pdf", pdfProcessRoutes);
app.use("/api", watermarkRoutes);
app.use("/api/resolution", resolutionRoutes);

// Download from URL endpoint
app.post("/api/download-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (err) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Download the file
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      maxRedirects: 5,
      timeout: 300000, // 5 minutes timeout
      maxContentLength: 10 * 1024 * 1024 * 1024, // 10GB limit
    });

    // Extract filename from URL or Content-Disposition header
    let filename = 'download';
    const contentDisposition = response.headers['content-disposition'];
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else {
      // Extract from URL path
      const urlPath = parsedUrl.pathname;
      const urlFilename = urlPath.split('/').pop();
      if (urlFilename && urlFilename.includes('.')) {
        filename = decodeURIComponent(urlFilename);
      }
    }

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    // Pipe the download stream to response
    response.data.pipe(res);

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: `Failed to download: ${error.response.statusText}` 
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ message: 'Download timeout - file too large or slow connection' });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ message: 'URL not found or unreachable' });
    }

    res.status(500).json({ 
      message: error.message || 'Failed to download file from URL' 
    });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
