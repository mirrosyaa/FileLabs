const fs = require("fs-extra");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const archiver = require("archiver");
const { exec } = require("child_process");
const { promisify } = require("util");
const Tesseract = require("tesseract.js");
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

// Convert document formats (PDF ↔ TXT ↔ HTML ↔ DOCX ↔ RTF)
const convertFormat = async (files, targetFormat) => {
  const outputFiles = [];
  const tempFiles = [];

  try {
    for (const file of files) {
      const inputPath = file.path;
      const inputExt = getExtension(file.originalname);
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      const outputPath = path.join(path.dirname(inputPath), `${baseName}.${targetFormat}`);

      console.log(`Converting ${file.originalname} from ${inputExt} to ${targetFormat}`);

      // PDF to TXT conversion using pdftotext
      if (inputExt === 'pdf' && targetFormat === 'txt') {
        const { stdout, stderr } = await execPromise(`/opt/homebrew/bin/pdftotext "${inputPath}" "${outputPath}"`);
        if (stderr) console.log('pdftotext stderr:', stderr);
        
        if (await fs.pathExists(outputPath)) {
          outputFiles.push({
            path: outputPath,
            originalname: `${baseName}.${targetFormat}`,
            mimetype: 'text/plain'
          });
          tempFiles.push(outputPath);
        } else {
          throw new Error('Conversion output file not found');
        }
      }
      // PDF to HTML conversion using pdftohtml
      else if (inputExt === 'pdf' && targetFormat === 'html') {
        await execPromise(`/opt/homebrew/bin/pdftohtml -s -noframes "${inputPath}" "${outputPath}"`);
        
        if (await fs.pathExists(outputPath)) {
          outputFiles.push({
            path: outputPath,
            originalname: `${baseName}.${targetFormat}`,
            mimetype: 'text/html'
          });
          tempFiles.push(outputPath);
        } else {
          throw new Error('Conversion output file not found');
        }
      }
      // PDF to DOCX - convert via TXT first since LibreOffice can't handle PDF→DOCX
      else if (inputExt === 'pdf' && targetFormat === 'docx') {
        try {
          // Step 1: PDF to TXT using pdftotext
          const tempTxtPath = path.join(path.dirname(inputPath), `${baseName}_temp.txt`);
          await execPromise(`/opt/homebrew/bin/pdftotext "${inputPath}" "${tempTxtPath}"`);
          
          if (!await fs.pathExists(tempTxtPath)) {
            throw new Error('Failed to extract text from PDF');
          }
          
          // Step 2: TXT to DOCX using LibreOffice
          const tempDir = path.join(path.dirname(inputPath), `convert_${Date.now()}`);
          await fs.ensureDir(tempDir);
          const tempInput = path.join(tempDir, 'input.txt');
          await fs.copy(tempTxtPath, tempInput);
          await fs.remove(tempTxtPath);
          
          const { stdout, stderr } = await execPromise(
            `/usr/local/bin/soffice --headless --convert-to docx --outdir "${tempDir}" "${tempInput}"`
          );
          console.log('LibreOffice stdout:', stdout);
          if (stderr) console.log('LibreOffice stderr:', stderr);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const tempOutput = path.join(tempDir, 'input.docx');
          if (await fs.pathExists(tempOutput)) {
            await fs.copy(tempOutput, outputPath);
            await fs.remove(tempDir);
            
            outputFiles.push({
              path: outputPath,
              originalname: `${baseName}.${targetFormat}`,
              mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            tempFiles.push(outputPath);
          } else {
            const dirFiles = await fs.readdir(tempDir);
            console.log('Files in temp dir:', dirFiles);
            await fs.remove(tempDir);
            throw new Error('DOCX conversion failed - output not found');
          }
        } catch (err) {
          console.error('DOCX conversion error:', err);
          throw new Error(`Failed to convert to DOCX: ${err.message}`);
        }
      }
      // PDF to RTF - convert via TXT first since LibreOffice can't handle PDF→RTF
      else if (inputExt === 'pdf' && targetFormat === 'rtf') {
        try {
          // Step 1: PDF to TXT using pdftotext
          const tempTxtPath = path.join(path.dirname(inputPath), `${baseName}_temp.txt`);
          await execPromise(`/opt/homebrew/bin/pdftotext "${inputPath}" "${tempTxtPath}"`);
          
          if (!await fs.pathExists(tempTxtPath)) {
            throw new Error('Failed to extract text from PDF');
          }
          
          // Step 2: TXT to RTF using LibreOffice
          const tempDir = path.join(path.dirname(inputPath), `convert_${Date.now()}`);
          await fs.ensureDir(tempDir);
          const tempInput = path.join(tempDir, 'input.txt');
          await fs.copy(tempTxtPath, tempInput);
          await fs.remove(tempTxtPath);
          
          const { stdout, stderr } = await execPromise(
            `/usr/local/bin/soffice --headless --convert-to rtf --outdir "${tempDir}" "${tempInput}"`
          );
          console.log('LibreOffice stdout:', stdout);
          if (stderr) console.log('LibreOffice stderr:', stderr);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const tempOutput = path.join(tempDir, 'input.rtf');
          if (await fs.pathExists(tempOutput)) {
            await fs.copy(tempOutput, outputPath);
            await fs.remove(tempDir);
            
            outputFiles.push({
              path: outputPath,
              originalname: `${baseName}.${targetFormat}`,
              mimetype: 'application/rtf'
            });
            tempFiles.push(outputPath);
          } else {
            const dirFiles = await fs.readdir(tempDir);
            console.log('Files in temp dir:', dirFiles);
            await fs.remove(tempDir);
            throw new Error('RTF conversion failed - output not found');
          }
        } catch (err) {
          console.error('RTF conversion error:', err);
          throw new Error(`Failed to convert to RTF: ${err.message}`);
        }
      }
      // TXT/HTML/DOCX/RTF to PDF conversion using text formatting or LibreOffice
      else if (['txt', 'html', 'docx', 'rtf'].includes(inputExt) && targetFormat === 'pdf') {
        if (inputExt === 'txt') {
          // Text to PDF using pdf-lib
          const textContent = await fs.readFile(inputPath, 'utf-8');
          const pdfDoc = await PDFDocument.create();
          let currentPage = pdfDoc.addPage([612, 792]);
          const lines = textContent.split('\n');
          let yPosition = 750;
          const fontSize = 12;
          const lineHeight = 14;
          
          for (const line of lines) {
            if (yPosition < 50) {
              currentPage = pdfDoc.addPage([612, 792]);
              yPosition = 750;
            }
            currentPage.drawText(line.substring(0, 80), {
              x: 50,
              y: yPosition,
              size: fontSize,
            });
            yPosition -= lineHeight;
          }
          
          const pdfBytes = await pdfDoc.save();
          await fs.writeFile(outputPath, pdfBytes);
        } else {
          // HTML/DOCX/RTF to PDF using LibreOffice
          const tempDir = path.join(path.dirname(inputPath), `convert_${Date.now()}`);
          await fs.ensureDir(tempDir);
          const tempInput = path.join(tempDir, `input.${inputExt}`);
          await fs.copy(inputPath, tempInput);
          
          const { stdout, stderr } = await execPromise(
            `/usr/local/bin/soffice --headless --convert-to pdf --outdir "${tempDir}" "${tempInput}"`
          );
          console.log('LibreOffice stdout:', stdout);
          if (stderr) console.log('LibreOffice stderr:', stderr);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const tempOutput = path.join(tempDir, 'input.pdf');
          if (await fs.pathExists(tempOutput)) {
            await fs.copy(tempOutput, outputPath);
            await fs.remove(tempDir);
          } else {
            const dirFiles = await fs.readdir(tempDir);
            console.log('Files in temp dir:', dirFiles);
            await fs.remove(tempDir);
            throw new Error('PDF conversion failed - output not found');
          }
        }
        
        if (await fs.pathExists(outputPath)) {
          outputFiles.push({
            path: outputPath,
            originalname: `${baseName}.${targetFormat}`,
            mimetype: 'application/pdf'
          });
          tempFiles.push(outputPath);
        } else {
          throw new Error('PDF conversion failed');
        }
      }
      // DOCX ↔ RTF ↔ HTML ↔ TXT conversions using LibreOffice
      else if (['docx', 'rtf', 'html', 'txt'].includes(inputExt) && ['docx', 'rtf', 'html', 'txt'].includes(targetFormat) && inputExt !== targetFormat) {
        const tempDir = path.join(path.dirname(inputPath), `convert_${Date.now()}`);
        await fs.ensureDir(tempDir);
        const tempInput = path.join(tempDir, `input.${inputExt}`);
        await fs.copy(inputPath, tempInput);
        
        const { stdout, stderr } = await execPromise(
          `/usr/local/bin/soffice --headless --convert-to ${targetFormat} --outdir "${tempDir}" "${tempInput}"`
        );
        console.log('LibreOffice stdout:', stdout);
        if (stderr) console.log('LibreOffice stderr:', stderr);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tempOutput = path.join(tempDir, `input.${targetFormat}`);
        if (await fs.pathExists(tempOutput)) {
          await fs.copy(tempOutput, outputPath);
          await fs.remove(tempDir);
          
          const mimeTypes = {
            'txt': 'text/plain',
            'html': 'text/html',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'rtf': 'application/rtf'
          };
          outputFiles.push({
            path: outputPath,
            originalname: `${baseName}.${targetFormat}`,
            mimetype: mimeTypes[targetFormat] || 'application/octet-stream'
          });
          tempFiles.push(outputPath);
        } else {
          const dirFiles = await fs.readdir(tempDir);
          console.log('Files in temp dir:', dirFiles);
          await fs.remove(tempDir);
          throw new Error('Conversion failed - output not found');
        }
      }
      // Image format conversions using sharp
      else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'ico'].includes(inputExt) && 
                ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'ico'].includes(targetFormat)) {
        try {
          let sharpInstance = sharp(inputPath);
          
          // Normalize target format
          let outputFormat = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
          let actualFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
          
          // Configure output based on format
          switch (actualFormat) {
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ quality: 90 });
              break;
            case 'png':
              sharpInstance = sharpInstance.png({ compressionLevel: 6 });
              break;
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality: 90 });
              break;
            case 'gif':
              sharpInstance = sharpInstance.gif();
              break;
            case 'bmp':
              // Sharp doesn't support BMP output directly, convert to PNG first then use external tool
              const tempPngPath = path.join(path.dirname(inputPath), `${baseName}_temp.png`);
              await sharp(inputPath).png().toFile(tempPngPath);
              // Use ImageMagick if available, otherwise just deliver PNG
              try {
                await execPromise(`convert "${tempPngPath}" "${outputPath}"`);
                await fs.remove(tempPngPath);
              } catch (err) {
                console.log('ImageMagick not available, delivering as PNG instead');
                await fs.move(tempPngPath, outputPath.replace('.bmp', '.png'));
                outputFiles.push({
                  path: outputPath.replace('.bmp', '.png'),
                  originalname: `${baseName}.png`,
                  mimetype: 'image/png'
                });
                tempFiles.push(outputPath.replace('.bmp', '.png'));
                continue;
              }
              break;
            case 'tiff':
              sharpInstance = sharpInstance.tiff({ compression: 'lzw' });
              break;
            case 'ico':
              // ICO format requires special handling, resize to standard icon size
              sharpInstance = sharpInstance.resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png();
              outputPath = outputPath.replace('.ico', '.png');
              actualFormat = 'png';
              console.log('Note: ICO conversion delivers as PNG format');
              break;
          }
          
          // Perform conversion (skip if BMP already handled)
          if (outputFormat !== 'bmp' || !await fs.pathExists(outputPath)) {
            await sharpInstance.toFile(outputPath);
          }
          
          const mimeTypes = {
            'jpeg': 'image/jpeg',
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'ico': 'image/x-icon'
          };
          
          outputFiles.push({
            path: outputPath,
            originalname: `${baseName}.${targetFormat === 'ico' ? 'png' : targetFormat}`,
            mimetype: mimeTypes[actualFormat] || 'image/png'
          });
          tempFiles.push(outputPath);
          
          console.log(`Image converted successfully: ${inputExt} -> ${targetFormat}`);
        } catch (err) {
          console.error('Image conversion error:', err);
          throw new Error(`Failed to convert image: ${err.message}`);
        }
      }
      // Video format conversions using ffmpeg
      else if (['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv'].includes(inputExt) && 
                ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv'].includes(targetFormat)) {
        try {
          // Check if ffmpeg is available
          try {
            await execPromise('which ffmpeg');
          } catch (err) {
            throw new Error('ffmpeg is not installed. Please install ffmpeg to convert video files.');
          }

          // Build ffmpeg command based on target format
          let ffmpegCmd = `ffmpeg -i "${inputPath}" `;
          
          switch (targetFormat) {
            case 'mp4':
              // H.264 codec for MP4 (most compatible)
              ffmpegCmd += `-c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
              break;
            case 'webm':
              // VP9 codec for WebM
              ffmpegCmd += `-c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "${outputPath}"`;
              break;
            case 'avi':
              // MPEG-4 codec for AVI
              ffmpegCmd += `-c:v mpeg4 -q:v 5 -c:a libmp3lame -q:a 5 "${outputPath}"`;
              break;
            case 'mov':
              // H.264 codec for MOV (QuickTime)
              ffmpegCmd += `-c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
              break;
            case 'mkv':
              // H.264 codec for MKV (Matroska)
              ffmpegCmd += `-c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
              break;
            case 'flv':
              // H.264 codec for FLV
              ffmpegCmd += `-c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
              break;
          }

          console.log(`Running ffmpeg command: ${ffmpegCmd}`);
          const { stdout, stderr } = await execPromise(ffmpegCmd);
          
          if (stderr && !stderr.includes('time=')) {
            console.log('ffmpeg stderr:', stderr);
          }

          if (await fs.pathExists(outputPath)) {
            const mimeTypes = {
              'mp4': 'video/mp4',
              'webm': 'video/webm',
              'avi': 'video/x-msvideo',
              'mov': 'video/quicktime',
              'mkv': 'video/x-matroska',
              'flv': 'video/x-flv'
            };

            outputFiles.push({
              path: outputPath,
              originalname: `${baseName}.${targetFormat}`,
              mimetype: mimeTypes[targetFormat] || 'video/mp4'
            });
            tempFiles.push(outputPath);
            
            console.log(`Video converted successfully: ${inputExt} -> ${targetFormat}`);
          } else {
            throw new Error('Video conversion output file not found');
          }
        } catch (err) {
          console.error('Video conversion error:', err);
          throw new Error(`Failed to convert video: ${err.message}`);
        }
      }
      // Audio format conversions using ffmpeg
      else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(inputExt) && 
                ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(targetFormat)) {
        try {
          // Check if ffmpeg is available
          try {
            await execPromise('which ffmpeg');
          } catch (err) {
            throw new Error('ffmpeg is not installed. Please install ffmpeg to convert audio files.');
          }

          // Build ffmpeg command based on target format
          let ffmpegCmd = `ffmpeg -i "${inputPath}" `;
          
          switch (targetFormat) {
            case 'mp3':
              // MP3 with good quality
              ffmpegCmd += `-c:a libmp3lame -b:a 192k "${outputPath}"`;
              break;
            case 'wav':
              // WAV (uncompressed)
              ffmpegCmd += `-c:a pcm_s16le "${outputPath}"`;
              break;
            case 'flac':
              // FLAC (lossless compression)
              ffmpegCmd += `-c:a flac -compression_level 5 "${outputPath}"`;
              break;
            case 'aac':
              // AAC with good quality
              ffmpegCmd += `-c:a aac -b:a 192k "${outputPath}"`;
              break;
            case 'ogg':
              // OGG Vorbis
              ffmpegCmd += `-c:a libvorbis -q:a 5 "${outputPath}"`;
              break;
            case 'm4a':
              // M4A (AAC in MP4 container)
              ffmpegCmd += `-c:a aac -b:a 192k "${outputPath}"`;
              break;
          }

          console.log(`Running ffmpeg command: ${ffmpegCmd}`);
          const { stdout, stderr } = await execPromise(ffmpegCmd);
          
          if (stderr && !stderr.includes('time=')) {
            console.log('ffmpeg stderr:', stderr);
          }

          if (await fs.pathExists(outputPath)) {
            const mimeTypes = {
              'mp3': 'audio/mpeg',
              'wav': 'audio/wav',
              'flac': 'audio/flac',
              'aac': 'audio/aac',
              'ogg': 'audio/ogg',
              'm4a': 'audio/mp4'
            };

            outputFiles.push({
              path: outputPath,
              originalname: `${baseName}.${targetFormat}`,
              mimetype: mimeTypes[targetFormat] || 'audio/mpeg'
            });
            tempFiles.push(outputPath);
            
            console.log(`Audio converted successfully: ${inputExt} -> ${targetFormat}`);
          } else {
            throw new Error('Audio conversion output file not found');
          }
        } catch (err) {
          console.error('Audio conversion error:', err);
          throw new Error(`Failed to convert audio: ${err.message}`);
        }
      }
      else {
        throw new Error(`Conversion from ${inputExt} to ${targetFormat} is not supported. Supported: PDF↔TXT↔HTML↔DOCX↔RTF, Image formats: JPG↔PNG↔WebP↔GIF↔TIFF, Audio formats: MP3↔WAV↔FLAC↔AAC↔OGG↔M4A, Video formats: MP4↔WebM↔AVI↔MOV↔MKV↔FLV`);
      }
    }

    return { outputFiles, tempFiles };
  } catch (error) {
    // Clean up any created files on error
    await cleanupFiles(tempFiles);
    throw error;
  }
};

// Compress PDF files
const compressPDF = async (files) => {
  const outputFiles = [];
  const tempFiles = [];

  try {
    for (const file of files) {
      const inputPath = file.path;
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      const outputPath = path.join(path.dirname(inputPath), `${baseName}_compressed.pdf`);

      console.log(`Compressing ${file.originalname}`);

      try {
        // Use Ghostscript for compression
        const gsCommand = `/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
        
        const { stdout, stderr } = await execPromise(gsCommand);
        if (stderr) console.log('Ghostscript stderr:', stderr);
        
        if (await fs.pathExists(outputPath)) {
          console.log(`Successfully compressed: ${outputPath}`);
          outputFiles.push({
            path: outputPath,
            originalname: `${baseName}_compressed.pdf`,
            mimetype: 'application/pdf'
          });
          tempFiles.push(outputPath);
        } else {
          throw new Error('Compression output file not found');
        }
      } catch (err) {
        console.error(`Compression error:`, err);
        throw new Error(`Failed to compress ${file.originalname}: ${err.message}`);
      }
    }

    return { outputFiles, tempFiles };
  } catch (error) {
    await cleanupFiles(tempFiles);
    throw error;
  }
};

// Merge multiple PDF files
const mergePDFs = async (files) => {
  if (files.length < 2) {
    throw new Error('At least 2 PDF files are required for merging');
  }

  const tempFiles = [];

  try {
    const mergedPdf = await PDFDocument.create();

    // Load and merge each PDF
    for (const file of files) {
      console.log(`Loading PDF: ${file.originalname}`);
      const pdfBytes = await fs.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    // Save merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const outputPath = path.join(path.dirname(files[0].path), 'merged.pdf');
    await fs.writeFile(outputPath, mergedPdfBytes);

    console.log(`Successfully merged ${files.length} PDFs: ${outputPath}`);
    tempFiles.push(outputPath);

    return {
      outputFiles: [{
        path: outputPath,
        originalname: 'merged.pdf',
        mimetype: 'application/pdf'
      }],
      tempFiles
    };
  } catch (error) {
    await cleanupFiles(tempFiles);
    throw new Error(`Failed to merge PDFs: ${error.message}`);
  }
};

// Split PDF into individual pages
const splitPDF = async (files) => {
  const outputFiles = [];
  const tempFiles = [];

  try {
    for (const file of files) {
      console.log(`Splitting ${file.originalname}`);
      const pdfBytes = await fs.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();
      
      const baseName = path.basename(file.originalname, '.pdf');
      const outputDir = path.dirname(file.path);

      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        
        const newPdfBytes = await newPdf.save();
        const outputPath = path.join(outputDir, `${baseName}_page_${i + 1}.pdf`);
        await fs.writeFile(outputPath, newPdfBytes);
        
        outputFiles.push({
          path: outputPath,
          originalname: `${baseName}_page_${i + 1}.pdf`,
          mimetype: 'application/pdf'
        });
        tempFiles.push(outputPath);
      }

      console.log(`Split ${file.originalname} into ${pageCount} pages`);
    }

    // If multiple files, create a ZIP
    if (outputFiles.length > 1) {
      const zipPath = path.join(path.dirname(files[0].path), 'split_pages.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Created ZIP: ${zipPath} (${archive.pointer()} bytes)`);
          tempFiles.push(zipPath);
          resolve({
            outputFiles: [{
              path: zipPath,
              originalname: 'split_pages.zip',
              mimetype: 'application/zip'
            }],
            tempFiles
          });
        });

        archive.on('error', reject);
        archive.pipe(output);

        outputFiles.forEach(file => {
          archive.file(file.path, { name: file.originalname });
        });

        archive.finalize();
      });
    }

    return { outputFiles, tempFiles };
  } catch (error) {
    await cleanupFiles(tempFiles);
    throw new Error(`Failed to split PDF: ${error.message}`);
  }
};

// Extract images from PDF
const extractImages = async (files) => {
  const outputFiles = [];
  const tempFiles = [];

  try {
    for (const file of files) {
      console.log(`Extracting images from ${file.originalname}`);
      const baseName = path.basename(file.originalname, '.pdf');
      const outputDir = path.dirname(file.path);
      const imagePrefix = path.join(outputDir, baseName);

      try {
        // Use pdfimages from poppler-utils
        const { stdout, stderr } = await execPromise(
          `/opt/homebrew/bin/pdfimages -png "${file.path}" "${imagePrefix}"`
        );
        if (stderr) console.log('pdfimages stderr:', stderr);

        // Find generated images
        const dirFiles = await fs.readdir(outputDir);
        const imageFiles = dirFiles.filter(f => 
          f.startsWith(baseName) && (f.endsWith('.png') || f.endsWith('.ppm'))
        );

        if (imageFiles.length === 0) {
          throw new Error('No images found in PDF');
        }

        for (const imgFile of imageFiles) {
          const imgPath = path.join(outputDir, imgFile);
          outputFiles.push({
            path: imgPath,
            originalname: imgFile,
            mimetype: 'image/png'
          });
          tempFiles.push(imgPath);
        }

        console.log(`Extracted ${imageFiles.length} images`);
      } catch (err) {
        console.error(`Image extraction error:`, err);
        throw new Error(`Failed to extract images: ${err.message}`);
      }
    }

    // Create ZIP if multiple images
    if (outputFiles.length > 1) {
      const zipPath = path.join(path.dirname(files[0].path), 'extracted_images.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Created ZIP: ${zipPath}`);
          tempFiles.push(zipPath);
          resolve({
            outputFiles: [{
              path: zipPath,
              originalname: 'extracted_images.zip',
              mimetype: 'application/zip'
            }],
            tempFiles
          });
        });

        archive.on('error', reject);
        archive.pipe(output);

        outputFiles.forEach(file => {
          archive.file(file.path, { name: file.originalname });
        });

        archive.finalize();
      });
    }

    return { outputFiles, tempFiles };
  } catch (error) {
    await cleanupFiles(tempFiles);
    throw error;
  }
};

// Perform OCR on images or PDFs
const performOCR = async (files) => {
  const outputFiles = [];
  const tempFiles = [];

  try {
    for (const file of files) {
      console.log(`Performing OCR on ${file.originalname}`);
      const inputExt = getExtension(file.originalname);
      let imagePath = file.path;
      
      // If PDF, convert first page to image
      if (inputExt === 'pdf') {
        const baseName = path.basename(file.originalname, '.pdf');
        const outputDir = path.dirname(file.path);
        const tempImagePrefix = path.join(outputDir, `${baseName}_temp`);
        
        try {
          await execPromise(`/opt/homebrew/bin/pdfimages -png -f 1 -l 1 "${file.path}" "${tempImagePrefix}"`);
          
          // Find the generated image
          const dirFiles = await fs.readdir(outputDir);
          const tempImage = dirFiles.find(f => f.startsWith(`${baseName}_temp`) && f.endsWith('.png'));
          
          if (!tempImage) {
            throw new Error('Failed to extract PDF page for OCR');
          }
          
          imagePath = path.join(outputDir, tempImage);
          tempFiles.push(imagePath);
        } catch (err) {
          throw new Error(`Failed to convert PDF for OCR: ${err.message}`);
        }
      }

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => console.log(m)
      });

      // Save OCR result
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      const outputPath = path.join(path.dirname(file.path), `${baseName}_ocr.txt`);
      await fs.writeFile(outputPath, text);

      console.log(`OCR completed: ${outputPath}`);
      outputFiles.push({
        path: outputPath,
        originalname: `${baseName}_ocr.txt`,
        mimetype: 'text/plain'
      });
      tempFiles.push(outputPath);
    }

    return { outputFiles, tempFiles };
  } catch (error) {
    await cleanupFiles(tempFiles);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

// Batch rename files
const batchRename = async (files, pattern) => {
  const outputFiles = [];
  const tempFiles = [];

  try {
    if (!pattern) {
      throw new Error('Rename pattern is required');
    }

    let counter = 1;
    for (const file of files) {
      const ext = path.extname(file.originalname);
      const newName = pattern.replace('{n}', counter).replace('{ext}', ext.slice(1));
      const newPath = path.join(path.dirname(file.path), newName + ext);

      await fs.copy(file.path, newPath);

      console.log(`Renamed: ${file.originalname} -> ${newName}${ext}`);
      outputFiles.push({
        path: newPath,
        originalname: newName + ext,
        mimetype: file.mimetype
      });
      tempFiles.push(newPath);
      counter++;
    }

    // Create ZIP for batch renamed files
    if (outputFiles.length > 1) {
      const zipPath = path.join(path.dirname(files[0].path), 'renamed_files.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Created ZIP: ${zipPath}`);
          tempFiles.push(zipPath);
          resolve({
            outputFiles: [{
              path: zipPath,
              originalname: 'renamed_files.zip',
              mimetype: 'application/zip'
            }],
            tempFiles
          });
        });

        archive.on('error', reject);
        archive.pipe(output);

        outputFiles.forEach(file => {
          archive.file(file.path, { name: file.originalname });
        });

        archive.finalize();
      });
    }

    return { outputFiles, tempFiles };
  } catch (error) {
    await cleanupFiles(tempFiles);
    throw new Error(`Batch rename failed: ${error.message}`);
  }
};

// Main controller function
const convertFiles = async (req, res) => {
  console.log('convertFiles controller called');
  console.log('Uploaded files:', req.files?.length);
  console.log('Request body:', req.body);

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { operation, format, pattern } = req.body;
    let result;

    switch (operation) {
      case 'convert':
        if (!format) {
          return res.status(400).json({ error: 'Target format is required' });
        }
        result = await convertFormat(req.files, format);
        break;

      case 'compress':
        result = await compressPDF(req.files);
        break;

      case 'merge':
        result = await mergePDFs(req.files);
        break;

      case 'split':
        result = await splitPDF(req.files);
        break;

      case 'extract':
        result = await extractImages(req.files);
        break;

      case 'ocr':
        result = await performOCR(req.files);
        break;

      case 'rename':
        result = await batchRename(req.files, pattern);
        break;

      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    // Send the first output file
    if (result.outputFiles && result.outputFiles.length > 0) {
      const outputFile = result.outputFiles[0];
      
      res.download(outputFile.path, outputFile.originalname, async (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        
        // Clean up temporary files after download
        await cleanupFiles(result.tempFiles);
        
        // Clean up uploaded files
        for (const file of req.files) {
          try {
            await fs.remove(file.path);
          } catch (e) {
            console.error('Error removing uploaded file:', e);
          }
        }
      });
    } else {
      throw new Error('No output files generated');
    }

  } catch (error) {
    console.error('Conversion error:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.remove(file.path);
        } catch (e) {
          console.error('Error removing uploaded file:', e);
        }
      }
    }
    
    res.status(500).json({ 
      error: error.message || 'Conversion failed',
      details: error.stack
    });
  }
};

module.exports = { convertFiles };
