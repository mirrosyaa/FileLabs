const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { compressFiles } = require("../controllers/compressController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/compress");
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
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
    // Accept all file types for compression
    cb(null, true);
  },
});

// POST /api/compress - Handle file compression
router.post("/compress", upload.array("files", 20), (req, res, next) => {
  console.log('Compress route hit');
  console.log('Files received:', req.files?.length || 0);
  console.log('Compression Level:', req.body.compressionLevel);
  next();
}, compressFiles);

module.exports = router;
