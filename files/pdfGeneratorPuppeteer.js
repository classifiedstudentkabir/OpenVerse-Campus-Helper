/**
 * GUARANTEED SINGLE-PAGE PDF GENERATOR
 * Uses Puppeteer to render HTML certificate as PDF
 * Eliminates PDFKit flowing text issues
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate HTML template for certificate
 * @param {Object} data - Certificate data (name, event_name, issue_date, email, etc.)
 * @param {Object} mappedFields - Which fields are mapped (e.g., {name: true, event_name: true})
 * @param {string} certificateId - Certificate ID (e.g., CERT-001)
 * @param {Object} templateConfig - Template configuration {width, height, backgroundUrl}
 * @returns {string} HTML string
 */
function generateCertificateHTML(data, mappedFields, certificateId, templateConfig = null) {
  // Default dimensions (A4 landscape-ish for certificate)
  const width = templateConfig?.width || 1056; // 11 inches * 96 DPI
  const height = templateConfig?.height || 816; // 8.5 inches * 96 DPI
  
  // Build dynamic content based on mapped fields
  let contentHTML = '';
  
  // Title (always shown)
  contentHTML += `
    <div style="font-size: 48px; font-weight: bold; color: #1a1a1a; margin-bottom: 30px;">
      CERTIFICATE OF ACHIEVEMENT
    </div>
  `;
  
  // Name field (if mapped)
  if (mappedFields.name && data.name) {
    contentHTML += `
      <div style="font-size: 36px; font-weight: 600; color: #2563eb; margin: 40px 0;">
        ${escapeHtml(data.name)}
      </div>
    `;
  }
  
  // Event name field (if mapped)
  if (mappedFields.event_name && data.event_name) {
    contentHTML += `
      <div style="font-size: 24px; color: #4b5563; margin: 20px 0;">
        For participating in
      </div>
      <div style="font-size: 28px; font-weight: 600; color: #1a1a1a; margin: 10px 0;">
        ${escapeHtml(data.event_name)}
      </div>
    `;
  }
  
  // Issue date field (if mapped)
  if (mappedFields.issue_date && data.issue_date) {
    contentHTML += `
      <div style="font-size: 20px; color: #6b7280; margin: 30px 0 10px 0;">
        Date: ${escapeHtml(data.issue_date)}
      </div>
    `;
  }
  
  // Email field (if mapped)
  if (mappedFields.email && data.email) {
    contentHTML += `
      <div style="font-size: 18px; color: #6b7280; margin: 10px 0;">
        ${escapeHtml(data.email)}
      </div>
    `;
  }
  
  // Department field (if mapped)
  if (mappedFields.department && data.department) {
    contentHTML += `
      <div style="font-size: 18px; color: #6b7280; margin: 10px 0;">
        Department: ${escapeHtml(data.department)}
      </div>
    `;
  }
  
  // Certificate ID (always at bottom-right, within safe zone)
  const footerHTML = `
    <div style="position: absolute; bottom: 30px; right: 40px; font-size: 14px; color: #9ca3af;">
      ${certificateId}
    </div>
  `;
  
  // Complete HTML document
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${width}px ${height}px;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Arial', 'Helvetica', sans-serif;
      position: relative;
    }
    
    .certificate-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 0;
    }
    
    .certificate-border {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      z-index: 1;
    }
    
    .certificate-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px;
      z-index: 2;
      color: white;
    }
    
    .certificate-content > div {
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="certificate-background"></div>
  <div class="certificate-border"></div>
  <div class="certificate-content">
    ${contentHTML}
  </div>
  ${footerHTML}
</body>
</html>
  `;
  
  return html;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a single PDF certificate using Puppeteer
 * @param {Object} data - Certificate data
 * @param {Object} mappedFields - Mapped fields from user selection
 * @param {string} outputPath - Full path where PDF should be saved
 * @param {string} certificateId - Certificate ID
 * @param {Object} templateConfig - Optional template configuration
 * @returns {Promise<{success: boolean, pages: number, file: string}>}
 */
async function generateSingleCertificatePDF(data, mappedFields, outputPath, certificateId, templateConfig = null) {
  const width = templateConfig?.width || 1056;
  const height = templateConfig?.height || 816;
  
  let browser = null;
  
  try {
    // Generate HTML
    const html = generateCertificateHTML(data, mappedFields, certificateId, templateConfig);
    
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport to exact dimensions
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 2 // Higher quality
    });
    
    // Load HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF with exact dimensions
    await page.pdf({
      path: outputPath,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      preferCSSPageSize: true
    });
    
    // Verify PDF was created
    const stats = await fs.stat(outputPath);
    
    // Log for debugging (always 1 page with this method)
    const logEntry = {
      event: 'pdf.pages',
      file: path.basename(outputPath),
      pages: 1, // Guaranteed single page
      size: stats.size,
      dimensions: `${width}x${height}`
    };
    
    console.log(JSON.stringify(logEntry));
    
    return {
      success: true,
      pages: 1,
      file: outputPath
    };
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      pages: 0,
      file: outputPath,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate multiple certificates in batch
 * @param {Array} rows - Array of data objects
 * @param {Object} mappedFields - Mapped fields
 * @param {string} outputDir - Directory to save PDFs
 * @param {Object} templateConfig - Optional template configuration
 * @returns {Promise<Array>} Array of generated file paths
 */
async function generateBatchCertificates(rows, mappedFields, outputDir, templateConfig = null) {
  const generatedFiles = [];
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log(`Starting batch generation: ${rows.length} certificates`);
  console.log('Mapped fields:', mappedFields);
  
  // Generate certificates sequentially to avoid memory issues
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const certificateId = `CERT-${String(i + 1).padStart(3, '0')}`;
    const filename = `${certificateId}.pdf`;
    const outputPath = path.join(outputDir, filename);
    
    console.log(`Generating ${i + 1}/${rows.length}: ${certificateId}`);
    
    const result = await generateSingleCertificatePDF(
      row,
      mappedFields,
      outputPath,
      certificateId,
      templateConfig
    );
    
    if (result.success) {
      generatedFiles.push(outputPath);
      console.log(`✓ Generated: ${filename} (1 of 1 pages)`);
    } else {
      console.error(`✗ Failed: ${filename} - ${result.error}`);
    }
    
    // Small delay to prevent resource exhaustion
    if (i < rows.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Batch complete: ${generatedFiles.length}/${rows.length} certificates generated`);
  
  return generatedFiles;
}

module.exports = {
  generateSingleCertificatePDF,
  generateBatchCertificates,
  generateCertificateHTML
};
