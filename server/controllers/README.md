# File Conversion Controller

This controller handles all file conversion operations for the FileLabs application.

## Operations Supported

### 1. Convert Format (DOCX ↔ PDF ↔ TXT ↔ RTF)
- **Operation ID**: `convert`
- **Required Parameters**: `format` (target format)
- **Supported Formats**: pdf, docx, txt, rtf
- **Description**: Converts documents between different formats using LibreOffice

### 2. Compress PDF
- **Operation ID**: `compress`
- **Required Parameters**: None
- **Description**: Compresses PDF files to reduce file size for email
- **Tools Used**: Ghostscript (primary) or pdf-lib (fallback)

### 3. Merge PDFs
- **Operation ID**: `merge`
- **Required Parameters**: None (requires multiple PDF files)
- **Description**: Combines multiple PDF files into a single document

### 4. Split PDF
- **Operation ID**: `split`
- **Required Parameters**: None
- **Description**: Splits a PDF into individual pages

### 5. Extract Images
- **Operation ID**: `extract`
- **Required Parameters**: None
- **Description**: Extracts all images from PDF files
- **Note**: Requires poppler-utils (pdfimages command)

### 6. OCR (Optical Character Recognition)
- **Operation ID**: `ocr`
- **Required Parameters**: None
- **Supported Files**: Images (PNG, JPG, JPEG)
- **Description**: Converts scanned documents/images to editable text

### 7. Batch Rename
- **Operation ID**: `rename`
- **Required Parameters**: `renamePattern`
- **Pattern Variables**:
  - `{n}` - Sequential number (001, 002, etc.)
  - `{date}` - Current date (YYYY-MM-DD)
  - `{original}` - Original filename (without extension)
- **Example**: `Document_{n}` → `Document_001.pdf`, `Document_002.pdf`

## System Requirements

### Required for all operations:
- Node.js
- npm packages: fs-extra, pdf-lib, archiver, multer

### Required for specific operations:

#### Format Conversion:
- LibreOffice installed on the system
- npm package: libreoffice-convert

#### PDF Compression:
- Ghostscript (optional, falls back to pdf-lib)

#### Image Extraction:
- poppler-utils (pdfimages command)

#### OCR:
- npm packages: tesseract.js, sharp

## Installation

### macOS:
```bash
# Install LibreOffice
brew install --cask libreoffice

# Install Ghostscript (optional, for better PDF compression)
brew install ghostscript

# Install poppler-utils (for image extraction)
brew install poppler
```

### Ubuntu/Debian:
```bash
# Install LibreOffice
sudo apt-get install libreoffice

# Install Ghostscript
sudo apt-get install ghostscript

# Install poppler-utils
sudo apt-get install poppler-utils
```

### Windows:
- Download and install LibreOffice from https://www.libreoffice.org/
- Download and install Ghostscript from https://www.ghostscript.com/
- Download poppler for Windows from https://github.com/oschwartz10612/poppler-windows

## Error Handling

All operations include:
- File validation
- Automatic cleanup of temporary files
- Detailed error messages
- Graceful fallbacks where applicable

## API Usage

```javascript
// Example request
POST /api/convert
Content-Type: multipart/form-data

files: [file1, file2, ...]
operation: "convert" | "compress" | "merge" | "split" | "extract" | "ocr" | "rename"
format: "pdf" | "docx" | "txt" | "rtf" (for convert operation)
renamePattern: "Document_{n}" (for rename operation)
```

## Response

- Single file: Direct file download
- Multiple files: ZIP archive download
- Error: JSON with error message
