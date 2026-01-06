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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common document formats
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(pdf|doc|docx|txt|rtf|png|jpg|jpeg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, DOC, TXT, RTF, and images are allowed."));
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
