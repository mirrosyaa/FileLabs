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
    const uploadPath = path.join(__dirname, '../uploads/crop');
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

// Crop images endpoint
router.post('/', upload.array('files', 50), async (req, res) => {
  try {
    console.log('Crop request received');
    console.log('Files:', req.files?.length);
    console.log('Body:', req.body);
    
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const croppedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i}:`, file.originalname);

      const outputFilename = `cropped_${Date.now()}_${path.parse(file.originalname).name}.jpg`;
      const outputPath = path.join(__dirname, '../uploads/crop', outputFilename);

      // The file is already cropped on the frontend, just optimize and save it
      await sharp(file.path)
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      croppedFiles.push({
        path: outputPath,
        name: outputFilename
      });

      // Clean up original file
      fs.unlinkSync(file.path);
    }

    console.log('Cropped files:', croppedFiles.length);

    // If single file, return it directly
    if (croppedFiles.length === 1) {
      res.download(croppedFiles[0].path, croppedFiles[0].name, (err) => {
        if (err) console.error(err);
        // Clean up
        fs.unlinkSync(croppedFiles[0].path);
      });
    } else {
      // Multiple files - create ZIP
      const zipFilename = `cropped_images_${Date.now()}.zip`;
      const zipPath = path.join(__dirname, '../uploads/crop', zipFilename);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        res.download(zipPath, zipFilename, (err) => {
          if (err) console.error(err);
          // Clean up all files
          fs.unlinkSync(zipPath);
          croppedFiles.forEach(file => fs.unlinkSync(file.path));
        });
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);

      croppedFiles.forEach(file => {
        archive.file(file.path, { name: file.name });
      });

      archive.finalize();
    }

  } catch (error) {
    console.error('Crop error:', error);
    res.status(500).json({ error: error.message || 'Failed to crop images' });
  }
});

module.exports = router;
