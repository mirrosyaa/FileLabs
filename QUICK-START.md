# 🚀 Quick Start - File Converter Testing

## Immediate Testing (No Additional Setup Required)

The file converter is ready to test! Here's the fastest way to see it in action:

### 1. Access the File Converter
```
Navigate to: http://localhost:3000/file-converter
```
(Login first if not already logged in)

### 2. Test Batch Rename (Works Immediately)
This operation requires **no additional software installation**:

1. **Upload Files**: Drag or click to upload any files (PDF, DOCX, TXT, images)
2. **Select Operation**: Click the "✏️ Batch Rename" button
3. **Enter Pattern**: Type `Document_{n}` in the pattern field
4. **Process**: Click "Process Files" button
5. **Download**: ZIP file downloads automatically with renamed files

### Pattern Examples:
- `Document_{n}` → Document_001.pdf, Document_002.pdf
- `File_{date}` → File_2026-01-02.pdf
- `{original}_{n}` → MyFile_001.pdf

---

## Test PDF Operations (If you have PDFs)

### Merge PDFs
1. Upload **2 or more PDF files**
2. Click "📎 Merge PDFs"
3. Click "Process Files"
4. Download merged PDF

### Split PDF
1. Upload **one multi-page PDF**
2. Click "✂️ Split PDF"
3. Click "Process File"
4. Download ZIP with individual pages

### Compress PDF
1. Upload **one or more PDFs**
2. Click "🗜️ Compress PDF"
3. Click "Process Files"
4. Download compressed PDF(s)

---

## Advanced Features (Require System Software)

### Format Conversion (Requires LibreOffice)
**Install First:**
```bash
brew install --cask libreoffice  # macOS
```

**Then Test:**
1. Upload DOCX file
2. Click "🔄 Convert Format"
3. Select "PDF" format
4. Process and download

### OCR (Works with Images)
1. Upload a PNG/JPG image with text
2. Click "📝 OCR (Scan to Text)"
3. Process and download text file

### Extract Images (Requires Poppler)
**Install First:**
```bash
brew install poppler  # macOS
```

**Then Test:**
1. Upload PDF with images
2. Click "🖼️ Extract Images"
3. Process and download images

---

## What You'll See

### During Upload:
- File list appears below upload area
- Each file shows name and size
- Remove button (✕) for each file

### After Selecting Operation:
- Operation button highlights in blue
- Format dropdown appears (if converting)
- Pattern input appears (if renaming)
- File summary shows

### During Processing:
- Button shows spinner
- Text changes to "Processing..."
- Button disabled to prevent double-click

### After Success:
- File downloads automatically
- Success message appears
- Option to "Process More Files"

### If Error:
- Error message shows with details
- "Try Again" button appears
- Can upload new files

---

## Troubleshooting

### "No files uploaded" error:
- Make sure files are selected before clicking process
- Check that files appear in the file list

### "Target format not specified":
- Select a format from the dropdown for Convert operation

### "Rename pattern not specified":
- Enter a pattern like `Document_{n}` for Batch Rename

### Download doesn't start:
- Check browser's download settings
- Look in your Downloads folder

---

## Expected Behavior

✅ **Single File Output**: Direct download (e.g., merged.pdf)  
✅ **Multiple Files Output**: ZIP archive (e.g., converted-files.zip)  
✅ **Processing Time**: 1-10 seconds depending on operation  
✅ **File Cleanup**: Temporary files deleted automatically  

---

## Current Server Status

Backend Server: ✅ Running on port 3001  
Database: ✅ Connected  
API Endpoint: ✅ /api/convert active  

---

## Next Steps After Testing

1. ✅ Test basic rename operation
2. ✅ Test PDF operations (merge, split, compress)
3. Install LibreOffice for format conversion
4. Install Poppler for image extraction
5. Test all operations with various file types

---

**Have fun testing! 🎉**

All features are implemented and ready to use. Start with the batch rename operation for immediate results!
