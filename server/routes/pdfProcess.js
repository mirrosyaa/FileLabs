const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { processPdf } = require("../controllers/pdfController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/pdf-process");
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
    fileSize: 200 * 1024 * 1024, // 200MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// POST /api/pdf/process - Handle PDF merge/split
router.post("/process", upload.array("files", 50), (req, res, next) => {
  console.log('PDF process route hit');
  console.log('Files received:', req.files?.length || 0);
  console.log('Operation:', req.body.operation);
  next();
}, processPdf);

module.exports = router;
