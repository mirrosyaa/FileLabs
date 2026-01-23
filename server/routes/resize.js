const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const archiver = require('archiver');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/resize');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Resize images endpoint
router.post('/', upload.array('files', 50), async (req, res) => {
  try {
    const files = req.files;
    const options = JSON.parse(req.body.options);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const resizedFiles = [];

    for (const file of files) {
      const outputFilename = `resized_${Date.now()}_${path.parse(file.originalname).name}.jpg`;
      const outputPath = path.join(__dirname, '../uploads/resize', outputFilename);

      let resizeOptions = {};

      // Handle different resize methods
      if (options.method === 'preset' || options.method === 'custom') {
        // Both preset and custom use width/height directly
        if (options.width && options.height) {
          resizeOptions = {
            width: parseInt(options.width),
            height: parseInt(options.height),
            fit: options.maintainAspectRatio ? 'inside' : 'fill'
          };
        } else if (options.width) {
          resizeOptions = { width: parseInt(options.width) };
        } else if (options.height) {
          resizeOptions = { height: parseInt(options.height) };
        }
      } else if (options.method === 'percentage') {
        const metadata = await sharp(file.path).metadata();
        const scale = options.percentage / 100;
        resizeOptions = {
          width: Math.round(metadata.width * scale),
          height: Math.round(metadata.height * scale)
        };
      }

      await sharp(file.path)
        .resize(resizeOptions)
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      resizedFiles.push({
        path: outputPath,
        name: outputFilename
      });

      // Clean up original file
      fs.unlinkSync(file.path);
    }

    // If single file, return it directly
    if (resizedFiles.length === 1) {
      res.download(resizedFiles[0].path, resizedFiles[0].name, (err) => {
        if (err) console.error(err);
        // Clean up
        fs.unlinkSync(resizedFiles[0].path);
      });
    } else {
      // Multiple files - create ZIP
      const zipFilename = `resized_images_${Date.now()}.zip`;
      const zipPath = path.join(__dirname, '../uploads/resize', zipFilename);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        res.download(zipPath, zipFilename, (err) => {
          if (err) console.error(err);
          // Clean up all files
          fs.unlinkSync(zipPath);
          resizedFiles.forEach(file => fs.unlinkSync(file.path));
        });
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);

      resizedFiles.forEach(file => {
        archive.file(file.path, { name: file.name });
      });

      archive.finalize();
    }

  } catch (error) {
    console.error('Resize error:', error);
    res.status(500).json({ error: error.message || 'Failed to resize images' });
  }
});

module.exports = router;
