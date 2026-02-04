const { PDFDocument } = require("pdf-lib");
const fs = require("fs-extra");
const path = require("path");

/**
 * Handle PDF merge and split operations
 */
const processPdf = async (req, res) => {
  const uploadedFiles = req.files;
  const { operation } = req.body;

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  if (!operation || (operation !== "merge" && operation !== "split")) {
    return res.status(400).json({ error: "Invalid operation. Must be 'merge' or 'split'" });
  }

  try {
    if (operation === "merge") {
      // MERGE PDFs
      const mergedPdf = await PDFDocument.create();

      for (const file of uploadedFiles) {
        const pdfBytes = await fs.readFile(file.path);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const outputFilename = `merged-${Date.now()}.pdf`;

      // Clean up uploaded files
      for (const file of uploadedFiles) {
        await fs.remove(file.path);
      }

      // Send the merged PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${outputFilename}"`);
      res.send(Buffer.from(mergedPdfBytes));

    } else if (operation === "split") {
      // SPLIT PDF - For now, split each page into separate PDFs
      const file = uploadedFiles[0]; // Use first file for splitting
      const pdfBytes = await fs.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      // Create a ZIP file with all split PDFs
      const archiver = require("archiver");
      const archive = archiver("zip", { zlib: { level: 9 } });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="split-pages-${Date.now()}.zip"`);

      archive.pipe(res);

      // Split each page
      for (let i = 0; i < pageCount; i++) {
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
        singlePagePdf.addPage(copiedPage);
        const singlePageBytes = await singlePagePdf.save();
        
        archive.append(Buffer.from(singlePageBytes), { name: `page-${i + 1}.pdf` });
      }

      await archive.finalize();

      // Clean up uploaded file
      await fs.remove(file.path);
    }

  } catch (error) {
    console.error("PDF processing error:", error);
    
    // Clean up uploaded files on error
    if (uploadedFiles) {
      for (const file of uploadedFiles) {
        await fs.remove(file.path).catch(console.error);
      }
    }

    res.status(500).json({ 
      error: "Failed to process PDF",
      details: error.message 
    });
  }
};

module.exports = { processPdf };
