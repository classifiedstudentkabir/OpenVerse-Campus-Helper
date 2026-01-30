/**
 * FIXED GENERATION SERVICE
 * Properly sends mapped fields to backend for batch generation
 * Retrieves mapping from sessionStorage
 */

import axios from 'axios';

/**
 * Generate certificates in batch
 * @param {File} csvFile - CSV or XLSX file
 * @returns {Promise<Object>} Generation result
 */
export async function generateBatchCertificates(csvFile) {
  try {
    // Get mapped fields from sessionStorage
    const selectedFieldsStr = sessionStorage.getItem('selectedFields');
    const fieldMappingStr = sessionStorage.getItem('fieldMapping');
    
    if (!selectedFieldsStr || !fieldMappingStr) {
      throw new Error('Field mapping not found. Please complete the mapping step first.');
    }
    
    const selectedFields = JSON.parse(selectedFieldsStr);
    const fieldMapping = JSON.parse(fieldMappingStr);
    
    // Build mapped fields object: only include selected fields with their column names
    // Backend expects: { name: true, event_name: true, email: true }
    // This tells backend which fields to render
    const mappedFieldsForBackend = {};
    
    Object.keys(selectedFields).forEach(certField => {
      if (selectedFields[certField]) {
        // Field is selected, include it
        mappedFieldsForBackend[certField] = true;
      }
    });
    
    console.log('Sending to backend:', {
      file: csvFile.name,
      mappedFields: mappedFieldsForBackend,
      columnMapping: fieldMapping
    });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('mappedFields', JSON.stringify(mappedFieldsForBackend));
    formData.append('columnMapping', JSON.stringify(fieldMapping));
    
    // Send request
    const response = await axios.post('/api/batch/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000 // 5 minute timeout for large batches
    });
    
    if (response.data.success) {
      console.log('Generation successful:', response.data);
      return response.data;
    } else {
      throw new Error(response.data.error || 'Generation failed');
    }
    
  } catch (error) {
    console.error('Generation error:', error);
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error during generation');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw error;
    }
  }
}

/**
 * Download ZIP file
 * @param {string} batchId - Batch ID
 */
export function downloadCertificatesZip(batchId) {
  const downloadUrl = `/api/batch/download/${batchId}`;
  
  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'certificates.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get certificate PDF URL
 * @param {string} batchId - Batch ID
 * @param {string} filename - Certificate filename
 * @returns {string} PDF URL
 */
export function getCertificateUrl(batchId, filename) {
  return `/api/batch/view/${batchId}/${filename}`;
}

/**
 * Parse sample data from CSV for preview
 * This runs in browser to show preview before uploading
 * @param {File} file - CSV file
 * @returns {Promise<Object>} { columns, sampleRow }
 */
export async function parseSampleData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        
        // Simple CSV parsing (first 2 lines only)
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header row and one data row'));
          return;
        }
        
        // Parse header
        const headerLine = lines[0];
        const columns = parseCSVLine(headerLine);
        
        // Parse first data row
        const dataLine = lines[1];
        const values = parseCSVLine(dataLine);
        
        // Create sample row object
        const sampleRow = {};
        columns.forEach((col, index) => {
          sampleRow[col] = values[index] || '';
        });
        
        resolve({
          columns,
          sampleRow
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

export default {
  generateBatchCertificates,
  downloadCertificatesZip,
  getCertificateUrl,
  parseSampleData
};
