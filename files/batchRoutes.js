/**
 * UPDATED BATCH GENERATION ROUTE
 * Integrates puppeteer-based PDF generation
 * Respects mapped fields from frontend
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const { generateBatchCertificates } = require('../services/pdfGeneratorPuppeteer');

// Configure multer for CSV/XLSX uploads
const upload = multer({
  dest: 'uploads/data/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

/**
 * POST /api/batch/generate
 * Generate certificates in batch
 * 
 * Body:
 * - file: CSV/XLSX file (multipart)
 * - mappedFields: JSON string of mapped fields object
 *   Example: {"name": true, "event_name": true, "issue_date": true, "email": true}
 */
router.post('/generate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Parse mapped fields from request
    let mappedFields = {};
    
    if (req.body.mappedFields) {
      try {
        mappedFields = JSON.parse(req.body.mappedFields);
      } catch (error) {
        console.error('Failed to parse mappedFields:', error);
        // Default to name only if parsing fails
        mappedFields = { name: true };
      }
    } else {
      // Default to name only if not provided
      mappedFields = { name: true };
    }
    
    console.log('Received mapped fields:', mappedFields);
    
    // Parse uploaded file
    const rows = await parseDataFile(req.file.path, req.file.originalname);
    
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid data rows found in file'
      });
    }
    
    console.log(`Parsed ${rows.length} rows from ${req.file.originalname}`);
    console.log('Sample row:', rows[0]);
    
    // Validate that mapped fields exist in data
    const sampleRow = rows[0];
    const missingFields = Object.keys(mappedFields)
      .filter(field => mappedFields[field] && !(field in sampleRow));
    
    if (missingFields.length > 0) {
      console.warn('Warning: Mapped fields not found in data:', missingFields);
    }
    
    // Create unique output directory for this batch
    const batchId = Date.now();
    const outputDir = path.join(__dirname, '../outputs', `batch_${batchId}`);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate certificates using Puppeteer
    console.log('Starting PDF generation with puppeteer...');
    const generatedFiles = await generateBatchCertificates(
      rows,
      mappedFields,
      outputDir
    );
    
    if (generatedFiles.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate any certificates'
      });
    }
    
    // Create ZIP file
    const zipPath = path.join(outputDir, 'certificates.zip');
    await createZipArchive(generatedFiles, zipPath);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(err => console.error('Cleanup error:', err));
    
    // Return success response
    res.json({
      success: true,
      batchId,
      totalCertificates: generatedFiles.length,
      downloadUrl: `/api/batch/download/${batchId}`,
      certificates: generatedFiles.map((filePath, index) => ({
        id: `CERT-${String(index + 1).padStart(3, '0')}`,
        filename: path.basename(filePath),
        url: `/api/batch/view/${batchId}/${path.basename(filePath)}`
      }))
    });
    
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/batch/download/:batchId
 * Download ZIP file for a batch
 */
router.get('/download/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const zipPath = path.join(__dirname, '../outputs', `batch_${batchId}`, 'certificates.zip');
    
    // Check if file exists
    await fs.access(zipPath);
    
    res.download(zipPath, 'certificates.zip', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(404).json({ error: 'Batch not found' });
  }
});

/**
 * GET /api/batch/view/:batchId/:filename
 * View individual certificate PDF
 */
router.get('/view/:batchId/:filename', async (req, res) => {
  try {
    const { batchId, filename } = req.params;
    const pdfPath = path.join(__dirname, '../outputs', `batch_${batchId}`, filename);
    
    // Check if file exists
    await fs.access(pdfPath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(pdfPath);
    
  } catch (error) {
    console.error('View error:', error);
    res.status(404).json({ error: 'Certificate not found' });
  }
});

/**
 * Parse CSV or Excel file
 * @param {string} filePath - Path to uploaded file
 * @param {string} originalName - Original filename
 * @returns {Promise<Array>} Array of row objects
 */
async function parseDataFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  
  if (ext === '.csv') {
    return parseCSV(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return parseExcel(filePath);
  } else {
    throw new Error('Unsupported file format');
  }
}

/**
 * Parse CSV file
 */
async function parseCSV(filePath) {
  const Papa = require('papaparse');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Parse Excel file
 */
async function parseExcel(filePath) {
  const XLSX = require('xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  return XLSX.utils.sheet_to_json(worksheet);
}

/**
 * Create ZIP archive from PDF files
 */
async function createZipArchive(filePaths, outputPath) {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    output.on('close', () => {
      console.log(`ZIP created: ${archive.pointer()} bytes`);
      resolve();
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add all PDF files to archive
    filePaths.forEach(filePath => {
      archive.file(filePath, { name: path.basename(filePath) });
    });
    
    archive.finalize();
  });
}

module.exports = router;
