const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/resolution');
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
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (videoExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Resolution mapping
const resolutionMap = {
  '480p': { width: 854, height: 480, label: '480p (SD)' },
  '720p': { width: 1280, height: 720, label: '720p (HD)' },
  '1080p': { width: 1920, height: 1080, label: '1080p (Full HD)' },
  '1440p': { width: 2560, height: 1440, label: '1440p (2K)' },
  '2160p': { width: 3840, height: 2160, label: '2160p (4K)' },
  '4320p': { width: 7680, height: 4320, label: '4320p (8K)' }
};

// Change video resolution endpoint
router.post('/change', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    const resolution = req.body.resolution;

    console.log('Resolution change request:', { filesCount: files?.length, resolution });

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!resolution || !resolutionMap[resolution]) {
      return res.status(400).json({ error: 'Invalid resolution specified' });
    }

    const targetRes = resolutionMap[resolution];
    const processedFile = files[0]; // Process first file for now

    const outputFilename = `${path.parse(processedFile.originalname).name}_${resolution}${path.extname(processedFile.originalname)}`;
    const outputPath = path.join(__dirname, '../uploads/resolution', outputFilename);

    // Process video with ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(processedFile.path)
        .size(`${targetRes.width}x${targetRes.height}`)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset medium',
          '-crf 23',
          '-movflags +faststart'
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', () => {
          console.log('Resolution change completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });

    // Send the processed file
    res.download(outputPath, outputFilename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      
      // Clean up files after a delay
      setTimeout(() => {
        try {
          if (fs.existsSync(processedFile.path)) {
            fs.unlinkSync(processedFile.path);
          }
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('Resolution change error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to change video resolution' });
  }
});

module.exports = router;
