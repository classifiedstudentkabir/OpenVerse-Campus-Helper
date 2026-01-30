/**
 * Client-side file parser for CSV and XLSX files
 * Used as fallback when API is unavailable
 */

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

/**
 * Parse CSV content
 */
function parseCSV(content: string): ParseResult {
  const lines = content.trim().split("\n");
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    rows.push(row);
  }

  return {
    headers,
    rows,
    rowCount: rows.length,
  };
}

/**
 * Parse XLSX file using a simple approach
 * Attempts to extract from binary, falls back to basic parsing
 */
async function parseXLSX(file: File): Promise<ParseResult> {
  // Try to use dynamic import if xlsx is available
  try {
    // This is a simple inline XLSX parser for demo purposes
    // In production, you'd use: npm install xlsx
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Look for the sheet.xml content (basic approach)
    // In real scenario, use: import XLSX from 'xlsx'
    // const workbook = XLSX.read(buffer, { type: 'array' });
    // const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // const data = XLSX.utils.sheet_to_json(sheet);

    // For now, return empty (user should use CSV as fallback)
    return { headers: [], rows: [], rowCount: 0 };
  } catch (e) {
    console.warn("XLSX parsing not available, try uploading as CSV", e);
    return { headers: [], rows: [], rowCount: 0 };
  }
}

/**
 * Main file parser - reads CSV or XLSX
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const isCSV = file.name.endsWith(".csv");
  const isXLSX = file.name.endsWith(".xlsx");

  if (!isCSV && !isXLSX) {
    throw new Error("Only CSV and XLSX files are supported");
  }

  const content = await file.text();

  if (isCSV) {
    return parseCSV(content);
  }

  // For XLSX, we'd need xlsx library - for now return empty
  // User should convert to CSV for demo
  return { headers: [], rows: [], rowCount: 0 };
}

/**
 * Parse file and return results (caller responsible for storage)
 */
export async function parseAndStoreFile(
  file: File
): Promise<{
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}> {
  const result = await parseFile(file);

  // Validate result
  if (!Array.isArray(result.rows) || result.rows.length === 0) {
    throw new Error("CSV file is empty or has no valid rows. Please check your file format.");
  }

  if (!Array.isArray(result.headers) || result.headers.length === 0) {
    throw new Error("CSV file has no headers. First row must contain column names.");
  }

  return {
    headers: result.headers,
    rows: result.rows,
    rowCount: result.rows.length,
  };
}
