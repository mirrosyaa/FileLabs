const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");
const { exec } = require("child_process");
const { promisify } = require("util");
const sharp = require("sharp");

const execPromise = promisify(exec);

// Helper function to get file extension
const getExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

// Helper function to clean up temporary files
const cleanupFiles = async (files) => {
  for (const file of files) {
    try {
      await fs.remove(file);
    } catch (err) {
      console.error(`Error removing file ${file}:`, err);
    }
  }
};

// Compress image files
const compressImage = async (inputPath, outputPath, quality) => {
  const ext = getExtension(inputPath);
  
  let sharpInstance = sharp(inputPath);
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      await sharpInstance.jpeg({ quality }).toFile(outputPath);
      break;
    case 'png':
      await sharpInstance.png({ compressionLevel: quality === 50 ? 9 : quality === 70 ? 6 : 3 }).toFile(outputPath);
      break;
    case 'webp':
      await sharpInstance.webp({ quality }).toFile(outputPath);
      break;
    default:
      // For other formats, convert to same format with compression
      await sharpInstance.toFile(outputPath);
  }
};

// Compress video files using ffmpeg
const compressVideo = async (inputPath, outputPath, compressionLevel) => {
  // Check if ffmpeg is available
  try {
    await execPromise('which ffmpeg');
  } catch (err) {
    throw new Error('ffmpeg is not installed. Please install ffmpeg to compress video files.');
  }

  let crf;
  switch (compressionLevel) {
    case 'low':
      crf = 18; // Higher quality, less compression
      break;
    case 'medium':
      crf = 23; // Balanced
      break;
    case 'high':
      crf = 28; // Lower quality, more compression
      break;
    default:
      crf = 23;
  }

  const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -crf ${crf} -preset medium -c:a aac -b:a 128k "${outputPath}"`;
  
  console.log(`Running ffmpeg command: ${ffmpegCmd}`);
  const { stdout, stderr } = await execPromise(ffmpegCmd);
  
  if (stderr && !stderr.includes('time=')) {
    console.log('ffmpeg stderr:', stderr);
  }
};

// Compress audio files using ffmpeg
const compressAudio = async (inputPath, outputPath, compressionLevel) => {
  // Check if ffmpeg is available
  try {
    await execPromise('which ffmpeg');
  } catch (err) {
    throw new Error('ffmpeg is not installed. Please install ffmpeg to compress audio files.');
  }

  let bitrate;
  switch (compressionLevel) {
    case 'low':
      bitrate = '256k'; // Higher quality, less compression
      break;
    case 'medium':
      bitrate = '192k'; // Balanced
      break;
    case 'high':
      bitrate = '128k'; // Lower quality, more compression
      break;
    default:
      bitrate = '192k';
  }

  const ext = getExtension(outputPath);
  let ffmpegCmd;

  if (ext === 'mp3') {
    ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a libmp3lame -b:a ${bitrate} "${outputPath}"`;
  } else if (ext === 'aac' || ext === 'm4a') {
    ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a aac -b:a ${bitrate} "${outputPath}"`;
  } else {
    ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a libmp3lame -b:a ${bitrate} "${outputPath}"`;
  }
  
  console.log(`Running ffmpeg command: ${ffmpegCmd}`);
  const { stdout, stderr } = await execPromise(ffmpegCmd);
  
  if (stderr && !stderr.includes('time=')) {
    console.log('ffmpeg stderr:', stderr);
  }
};

// Main compression handler
const compressFiles = async (req, res) => {
  console.log('Compress controller started');
  const files = req.files;
  const compressionLevel = req.body.compressionLevel || 'medium';

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const compressedFiles = [];
  const tempFiles = [];

  try {
    // Determine quality settings based on compression level
    let imageQuality;
    switch (compressionLevel) {
      case 'low':
        imageQuality = 80;
        break;
      case 'medium':
        imageQuality = 70;
        break;
      case 'high':
        imageQuality = 50;
        break;
      default:
        imageQuality = 70;
    }

    for (const file of files) {
      const inputPath = file.path;
      const ext = getExtension(file.originalname);
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      const outputPath = path.join(path.dirname(inputPath), `compressed_${baseName}.${ext}`);

      console.log(`Compressing ${file.originalname} with ${compressionLevel} compression`);

      // Compress based on file type
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'].includes(ext)) {
        // Image compression
        await compressImage(inputPath, outputPath, imageQuality);
        compressedFiles.push({ path: outputPath, originalname: `compressed_${baseName}.${ext}` });
        tempFiles.push(outputPath);
      } 
      else if (['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv'].includes(ext)) {
        // Video compression
        await compressVideo(inputPath, outputPath, compressionLevel);
        compressedFiles.push({ path: outputPath, originalname: `compressed_${baseName}.${ext}` });
        tempFiles.push(outputPath);
      }
      else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
        // Audio compression
        await compressAudio(inputPath, outputPath, compressionLevel);
        compressedFiles.push({ path: outputPath, originalname: `compressed_${baseName}.${ext}` });
        tempFiles.push(outputPath);
      }
      else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'html'].includes(ext)) {
        // For documents, just copy (no compression available without quality loss)
        // Or we could zip them
        compressedFiles.push({ path: inputPath, originalname: file.originalname });
      }
      else {
        // Unknown file type - just include as is
        compressedFiles.push({ path: inputPath, originalname: file.originalname });
      }

      // Add input file to cleanup
      tempFiles.push(inputPath);
    }

    // If single file, send it directly
    if (compressedFiles.length === 1) {
      const file = compressedFiles[0];
      res.download(file.path, file.originalname, async (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Cleanup after download
        await cleanupFiles(tempFiles);
      });
    } else {
      // Multiple files - create a zip
      const zipPath = path.join(path.dirname(files[0].path), `compressed-${Date.now()}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: compressionLevel === 'high' ? 9 : compressionLevel === 'medium' ? 6 : 3 }
      });

      output.on('close', async () => {
        console.log(`Zip created: ${archive.pointer()} bytes`);
        res.download(zipPath, 'compressed.zip', async (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Cleanup after download
          await cleanupFiles([...tempFiles, zipPath]);
        });
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);

      // Add files to zip
      for (const file of compressedFiles) {
        archive.file(file.path, { name: file.originalname });
      }

      await archive.finalize();
    }

  } catch (error) {
    console.error('Compression error:', error);
    await cleanupFiles(tempFiles);
    res.status(500).json({ 
      error: error.message || "Failed to compress files" 
    });
  }
};

module.exports = { compressFiles };
