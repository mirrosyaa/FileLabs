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
    const { 
      watermarkType, 
      watermarkText, 
      anchorPosition, 
      opacity,
      fontFamily,
      fontSize,
      color,
      strokeEnabled,
      strokeColor,
      strokeWidth,
      rotation,
      pdfPages,
      pdfPageRange,
      tiledMode
    } = req.body;

    console.log("Received watermark request:", {
      filesCount: files?.length,
      watermarkType,
      watermarkText,
      anchorPosition,
      opacity
    });

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (watermarkType === "text" && !watermarkText) {
      return res.status(400).json({ message: "Watermark text is required" });
    }

    if (watermarkType === "image" && !req.files.find(f => f.fieldname === "watermarkImage")) {
      return res.status(400).json({ message: "Watermark image is required" });
    }

    const file = files[0]; // Process first file
    const fileExt = path.extname(file.originalname).toLowerCase();
    const outputPath = path.join(
      file.destination,
      `watermarked-${file.filename}`
    );

    console.log("Processing file:", {
      originalName: file.originalname,
      extension: fileExt,
      outputPath
    });

    // Determine file type and process accordingly
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tiff"];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v", ".flv", ".wmv"];
    const pdfExtensions = [".pdf"];

    if (imageExtensions.includes(fileExt)) {
      // Process image with sharp
      await addWatermarkToImage(file.path, outputPath, {
        text: watermarkText,
        position: anchorPosition || "bottom-right",
        opacity: parseFloat(opacity) || 0.8,
        fontFamily: fontFamily || "Arial",
        fontSize: parseInt(fontSize) || 4,
        color: color || "#ffffff",
        strokeEnabled: strokeEnabled === "true",
        strokeColor: strokeColor || "#000000",
        strokeWidth: parseInt(strokeWidth) || 2,
        rotation: parseFloat(rotation) || 0
      });
    } else if (videoExtensions.includes(fileExt)) {
      // Process video with ffmpeg
      await addWatermarkToVideo(file.path, outputPath, {
        text: watermarkText,
        position: anchorPosition || "bottom-right",
        opacity: parseFloat(opacity) || 0.8,
        fontFamily: fontFamily || "Arial",
        fontSize: parseInt(fontSize) || 24
      });
    } else if (pdfExtensions.includes(fileExt)) {
      // TODO: Implement PDF watermarking
      return res.status(400).json({ 
        message: "PDF watermarking is not yet implemented." 
      });
    } else {
      return res.status(400).json({ 
        message: "Unsupported file type. Only images and videos are supported." 
      });
    }

    console.log("Watermark processing complete, sending file...");

    // Send the watermarked file
    res.download(outputPath, `watermarked-${file.originalname}`, (err) => {
      // Cleanup
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      if (err) {
        console.error("Error sending file:", err);
      } else {
        console.log("File sent successfully");
      }
    });
  } catch (error) {
    console.error("Error adding watermark:", error);
    res.status(500).json({ message: "Failed to add watermark", error: error.message });
  }
});

// Helper function to add watermark to images
async function addWatermarkToImage(inputPath, outputPath, options) {
  const { text, position, opacity, fontFamily, fontSize, color, strokeEnabled, strokeColor, strokeWidth, rotation } = options;
  
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Calculate font size based on percentage of shorter side
  const shorterSide = Math.min(metadata.width, metadata.height);
  const calculatedFontSize = Math.round((shorterSide * fontSize) / 100);
  const padding = 20;
  const watermarkOpacity = parseFloat(opacity);
  
  // Estimate text dimensions
  const textWidth = text.length * (calculatedFontSize * 0.6);
  const textHeight = calculatedFontSize;
  
  // Calculate position
  let x, y;
  
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
    case "middle-left":
      x = padding;
      y = metadata.height / 2;
      break;
    case "center":
      x = (metadata.width - textWidth) / 2;
      y = metadata.height / 2;
      break;
    case "middle-right":
      x = metadata.width - textWidth - padding;
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
  
  // Build SVG watermark
  let svgContent = `<svg width="${metadata.width}" height="${metadata.height}">`;
  
  if (rotation) {
    svgContent += `<g transform="rotate(${rotation} ${x} ${y})">`;
  }
  
  svgContent += `<text 
    x="${x}" 
    y="${y}" 
    font-size="${calculatedFontSize}" 
    fill="${color}" 
    fill-opacity="${watermarkOpacity}"
    font-family="${fontFamily}, Arial, sans-serif"
    font-weight="bold"`;
  
  if (strokeEnabled) {
    svgContent += ` stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-opacity="${watermarkOpacity * 0.8}"`;
  }
  
  svgContent += `>${text}</text>`;
  
  if (rotation) {
    svgContent += `</g>`;
  }
  
  svgContent += `</svg>`;
  
  const svgWatermark = Buffer.from(svgContent);
  
  await image
    .composite([{ input: svgWatermark, top: 0, left: 0 }])
    .toFile(outputPath);
}

// Helper function to add watermark to videos
async function addWatermarkToVideo(inputPath, outputPath, options) {
  const { text, position, opacity, fontFamily, fontSize } = options;
  
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
      case "middle-left":
        xPosition = "10";
        yPosition = "(h-text_h)/2";
        break;
      case "center":
        xPosition = "(w-text_w)/2";
        yPosition = "(h-text_h)/2";
        break;
      case "middle-right":
        xPosition = "w-text_w-10";
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
    
    const watermarkOpacity = parseFloat(opacity);
    const escapedText = text.replace(/'/g, "\\'").replace(/:/g, "\\:");
    
    ffmpeg(inputPath)
      .outputOptions([
        `-vf`,
        `drawtext=text='${escapedText}':fontcolor=white@${watermarkOpacity}:fontsize=${fontSize}:fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:box=1:boxcolor=black@${watermarkOpacity * 0.5}:boxborderw=5:x=${xPosition}:y=${yPosition}`
      ])
      .on("end", () => {
        console.log("Video watermark processing complete");
        resolve();
      })
      .on("error", (err) => {
        console.error("Video watermark error:", err);
        reject(err);
      })
      .save(outputPath);
  });
}

module.exports = router;
