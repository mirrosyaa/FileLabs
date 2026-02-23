const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/watermark");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Add watermark endpoint
router.post("/watermark/add", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const { watermarkText, position, opacity } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (!watermarkText) {
      return res.status(400).json({ message: "Watermark text is required" });
    }

    const file = files[0]; // Process first file for now
    const fileExt = path.extname(file.originalname).toLowerCase();
    const outputPath = path.join(
      file.destination,
      `watermarked-${file.filename}`
    );

    // Determine file type and process accordingly
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm"];

    if (imageExtensions.includes(fileExt)) {
      // Process image with sharp
      await addWatermarkToImage(file.path, outputPath, watermarkText, position, opacity);
    } else if (videoExtensions.includes(fileExt)) {
      // Process video with ffmpeg
      await addWatermarkToVideo(file.path, outputPath, watermarkText, position, opacity);
    } else {
      // For audio files, return error as watermarks don't apply
      return res.status(400).json({ 
        message: "Audio files cannot have visual watermarks. Only images and videos are supported." 
      });
    }

    // Send the watermarked file
    res.download(outputPath, `watermarked-${file.originalname}`, (err) => {
      // Cleanup
      fs.unlinkSync(file.path);
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      if (err) {
        console.error("Error sending file:", err);
      }
    });
  } catch (error) {
    console.error("Error adding watermark:", error);
    res.status(500).json({ message: "Failed to add watermark", error: error.message });
  }
});

// Helper function to add watermark to images
async function addWatermarkToImage(inputPath, outputPath, text, position, opacity) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Create SVG watermark
  const fontSize = Math.round(metadata.width / 25);
  const padding = 20;
  const watermarkOpacity = parseFloat(opacity) || 0.5;
  
  // Calculate position
  let x, y;
  const textWidth = text.length * (fontSize * 0.6);
  const textHeight = fontSize;
  
  switch (position) {
    case "top-left":
      x = padding;
      y = padding + textHeight;
      break;
    case "top-center":
      x = (metadata.width - textWidth) / 2;
      y = padding + textHeight;
      break;
    case "top-right":
      x = metadata.width - textWidth - padding;
      y = padding + textHeight;
      break;
    case "center":
      x = (metadata.width - textWidth) / 2;
      y = metadata.height / 2;
      break;
    case "bottom-left":
      x = padding;
      y = metadata.height - padding;
      break;
    case "bottom-center":
      x = (metadata.width - textWidth) / 2;
      y = metadata.height - padding;
      break;
    case "bottom-right":
      x = metadata.width - textWidth - padding;
      y = metadata.height - padding;
      break;
    default:
      x = metadata.width - textWidth - padding;
      y = metadata.height - padding;
  }
  
  const svgWatermark = Buffer.from(`
    <svg width="${metadata.width}" height="${metadata.height}">
      <text 
        x="${x}" 
        y="${y}" 
        font-size="${fontSize}" 
        fill="white" 
        fill-opacity="${watermarkOpacity}"
        font-family="Arial, sans-serif"
        font-weight="bold"
        stroke="black"
        stroke-width="1"
        stroke-opacity="${watermarkOpacity * 0.5}"
      >${text}</text>
    </svg>
  `);
  
  await image
    .composite([{ input: svgWatermark, top: 0, left: 0 }])
    .toFile(outputPath);
}

// Helper function to add watermark to videos
async function addWatermarkToVideo(inputPath, outputPath, text, position, opacity) {
  return new Promise((resolve, reject) => {
    // Map position to ffmpeg drawtext position
    let xPosition, yPosition;
    
    switch (position) {
      case "top-left":
        xPosition = "10";
        yPosition = "10";
        break;
      case "top-center":
        xPosition = "(w-text_w)/2";
        yPosition = "10";
        break;
      case "top-right":
        xPosition = "w-text_w-10";
        yPosition = "10";
        break;
      case "center":
        xPosition = "(w-text_w)/2";
        yPosition = "(h-text_h)/2";
        break;
      case "bottom-left":
        xPosition = "10";
        yPosition = "h-text_h-10";
        break;
      case "bottom-center":
        xPosition = "(w-text_w)/2";
        yPosition = "h-text_h-10";
        break;
      case "bottom-right":
        xPosition = "w-text_w-10";
        yPosition = "h-text_h-10";
        break;
      default:
        xPosition = "w-text_w-10";
        yPosition = "h-text_h-10";
    }
    
    const watermarkOpacity = parseFloat(opacity) || 0.5;
    
    ffmpeg(inputPath)
      .outputOptions([
        `-vf`,
        `drawtext=text='${text}':fontcolor=white@${watermarkOpacity}:fontsize=24:box=1:boxcolor=black@${watermarkOpacity * 0.5}:boxborderw=5:x=${xPosition}:y=${yPosition}`
      ])
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

module.exports = router;
