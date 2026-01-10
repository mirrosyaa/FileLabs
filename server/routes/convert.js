const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { convertFiles } = require("../controllers/convertController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Remove spaces and special characters from filename to avoid LibreOffice issues
    const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, uniqueSuffix + "-" + sanitized);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common document, image, audio, and video formats
    const allowedTypes = [
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
      // Images
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/x-icon",
      // Audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/flac",
      "audio/aac",
      "audio/ogg",
      "audio/mp4",
      "audio/x-m4a",
      // Video
      "video/mp4",
      "video/webm",
      "video/x-msvideo",
      "video/quicktime",
      "video/x-matroska",
      "video/x-flv",
    ];

    const fileExtensionMatch = file.originalname.match(/\.(pdf|doc|docx|txt|rtf|html|png|jpg|jpeg|gif|webp|bmp|tiff|ico|mp3|wav|flac|aac|ogg|m4a|mp4|webm|avi|mov|mkv|flv)$/i);

    if (allowedTypes.includes(file.mimetype) || fileExtensionMatch) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only documents, images, audio, and video files are allowed."));
    }
  },
});

// POST /api/convert - Handle file conversion
router.post("/convert", upload.array("files", 20), (req, res, next) => {
  console.log('Convert route hit');
  console.log('Files received:', req.files?.length || 0);
  console.log('Operation:', req.body.operation);
  console.log('Format:', req.body.format);
  next();
}, convertFiles);

module.exports = router;
