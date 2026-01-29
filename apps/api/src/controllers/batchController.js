const certificateService = require('../services/certificateService');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const archiver = require('archiver');
const { PDFDocument } = require('pdf-lib');

const DEFAULT_BATCH_TIMEOUT_MS = Number(process.env.BATCH_RENDER_TIMEOUT_MS || 30000);
const DEFAULT_ZIP_TIMEOUT_MS = Number(process.env.ZIP_TIMEOUT_MS || 60000);
const BATCH_PROGRESS_EVERY = Number(process.env.BATCH_PROGRESS_EVERY || 5);

const logEvent = (event, data = {}) => {
    console.log(JSON.stringify({ at: new Date().toISOString(), scope: 'batchController', event, ...data }));
};

const withTimeout = (promise, ms, label) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([
        promise.finally(() => clearTimeout(timeoutId)),
        timeout
    ]);
};

// In-memory batch storage (would be database in production)
const batches = {};

// Helper to get template
const getTemplateById = (id) => {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'templates.json');
        if (!fs.existsSync(dataPath)) return null;
        const templates = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        return templates.find(t => t.id === id);
    } catch (e) {
        return null;
    }
};

// Helper to read file data
const readFileData = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        console.log(`[Batch] Reading file: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            // Fallback for demo if file validation mocked
            if (filename === 'sample_certifyneo.csv') {
                const p = path.join(process.cwd(), 'sample_certifyneo.csv');
                const results = [];
                fs.createReadStream(p)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', reject);
                return;
            }
            return reject(new Error(`File not found: ${filename}`));
        }

        const ext = path.extname(filename).toLowerCase();
        if (ext === '.csv') {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log(`[Batch] CSV parsed: ${results.length} rows`);
                    resolve(results);
                })
                .on('error', reject);
        } else if (ext === '.xlsx') {
            try {
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet);
                console.log(`[Batch] XLSX parsed: ${data.length} rows`);
                resolve(data);
            } catch (e) {
                reject(e);
            }
        } else {
            reject(new Error('Unsupported file type'));
        }
    });
};

// Helper to create ZIP from generated files
const verifyAndNormalizePdf = async (pdfPath) => {
    const bytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(bytes);
    const pages = pdfDoc.getPageCount();
    logEvent('pdf.verify.pages', { path: pdfPath, pages });

    if (pages > 1) {
        const normalized = await PDFDocument.create();
        const [firstPage] = await normalized.copyPages(pdfDoc, [0]);
        normalized.addPage(firstPage);
        const outBytes = await normalized.save();
        fs.writeFileSync(pdfPath, outBytes);
        logEvent('pdf.normalize.single', { path: pdfPath, pages });
    }
};

const createZip = (files, batchId) => {
    return new Promise((resolve, reject) => {
        const zipFilename = `certificates_${batchId}.zip`;
        const zipPath = path.join(process.cwd(), 'generated', zipFilename);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        let settled = false;
        const finalize = (err) => {
            if (settled) return;
            settled = true;
            if (err) {
                return reject(err);
            }
            resolve(zipFilename);
        };

        const timeoutId = setTimeout(() => {
            try { archive.abort(); } catch (e) { }
            try { output.destroy(); } catch (e) { }
            finalize(new Error(`zip-creation timed out after ${DEFAULT_ZIP_TIMEOUT_MS}ms`));
        }, DEFAULT_ZIP_TIMEOUT_MS);

        output.on('close', () => {
            clearTimeout(timeoutId);
            console.log(`[Batch] ZIP created: ${zipFilename} (${archive.pointer()} bytes)`);
            finalize();
        });

        output.on('error', (err) => {
            clearTimeout(timeoutId);
            console.error('[Batch] ZIP output error:', err);
            finalize(err);
        });

        archive.on('warning', (err) => {
            console.warn('[Batch] ZIP warning:', err);
        });

        archive.on('error', (err) => {
            clearTimeout(timeoutId);
            console.error('[Batch] ZIP error:', err);
            finalize(err);
        });

        archive.pipe(output);

        // Add each generated file to the ZIP
        for (const file of files) {
            const filePath = path.join(process.cwd(), 'generated', file);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file });
            }
        }

        archive.finalize();
    });
};

/**
 * Create a new batch
 * POST /api/batches
 * Body: { filename, templateId, mapping }
 */
exports.createBatch = (req, res) => {
    const id = 'batch_' + Date.now();
    const { filename, templateId, mapping } = req.body;

    console.log(`[Batch] Creating batch ${id} with file: ${filename}, template: ${templateId}`);
    console.log(`[Batch] Mapping:`, mapping);

    batches[id] = {
        id,
        status: 'pending',
        items: [],
        filename: filename,
        templateId: templateId || 'default-1',
        mapping: mapping || {},
        generatedCount: 0,
        totalCount: 0,
        zipFile: null,
        createdAt: new Date().toISOString()
    };

    res.status(201).json({ message: 'Batch created', batchId: id, batch: batches[id] });
};

/**
 * Generate certificates for a batch
 * POST /api/batches/:id/generate
 * Body: { templateId?, filename?, mapping? } - optional overrides
 */
exports.generateBatch = async (req, res) => {
    const reqStart = Date.now();
    const { id } = req.params;
    let batch = batches[id];
    logEvent('request.received', { route: 'generateBatch', batchId: id });

    // If batch doesn't exist, create one on the fly with provided data
    if (!batch) {
        console.log(`[Batch] Batch ${id} not found, creating from request body`);
        const { filename, templateId, mapping } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'No batch found and no filename provided' });
        }
        batch = {
            id,
            status: 'pending',
            items: [],
            filename,
            templateId: templateId || 'default-1',
            mapping: mapping || {},
            generatedCount: 0,
            totalCount: 0,
            zipFile: null,
            createdAt: new Date().toISOString()
        };
        batches[id] = batch;
    }

    // Allow overriding in generate call
    const templateId = req.body.templateId || batch.templateId || 'default-1';
    const filename = req.body.filename || batch.filename;
    const mapping = req.body.mapping || batch.mapping || {};

    if (!filename) {
        return res.status(400).json({ error: 'No filename provided for generation' });
    }

    const templateStart = Date.now();
    const template = getTemplateById(templateId);
    logEvent('template.fetch', { batchId: id, templateId, durationMs: Date.now() - templateStart, found: !!template });
    if (!template) {
        return res.status(400).json({ error: 'Template not found (ID: ' + templateId + ')' });
    }

    try {
        console.log(`[Batch] Starting generation for batch ${id}`);
        console.log(`[Batch] Template: ${template.name}, File: ${filename}`);
        console.log(`[Batch] Mapping: ${JSON.stringify(mapping)}`);

        batch.status = 'processing';
        batch.templateId = templateId;
        batch.filename = filename;
        batch.mapping = mapping;

        const readStart = Date.now();
        const rows = await readFileData(filename);
        logEvent('file.read', { batchId: id, filename, rows: rows.length, durationMs: Date.now() - readStart });
        batch.totalCount = rows.length;

        const generatedFiles = [];
        const limit = Math.min(rows.length, 50); // Limit for MVP

        console.log(`[Batch] Processing ${limit} of ${rows.length} rows`);

        for (let i = 0; i < limit; i++) {
            const row = rows[i];

            // Apply field mapping to create rowData for template
            const rowData = {};
            for (const [templateField, sourceColumn] of Object.entries(mapping)) {
                rowData[templateField] = row[sourceColumn] || '';
            }

            // Also include raw row data for any unmapped fields
            Object.assign(rowData, row);

            // Safe filename generation
            const nameValue = rowData.name || rowData.Name || row.name || row.Name || `cert_${i}`;
            const safeName = String(nameValue).replace(/[^a-z0-9]/gi, '_').substring(0, 30);
            // Change extension to .pdf to trigger PDF generation
            const outFile = `cert_${id}_${safeName}_${i}.pdf`;

            const renderStart = Date.now();
            const outputPath = await withTimeout(
                certificateService.generateCertificate(template, rowData, outFile),
                DEFAULT_BATCH_TIMEOUT_MS,
                `render:${outFile}`
            );
            logEvent('render.complete', { batchId: id, file: outFile, durationMs: Date.now() - renderStart });
            logEvent('batch.pdf.path', { path: outputPath, generator: 'certificateService.generateCertificate' });
            await verifyAndNormalizePdf(outputPath);

            generatedFiles.push(outFile);
            batch.generatedCount = i + 1;

            if ((i + 1) % BATCH_PROGRESS_EVERY === 0 || i === limit - 1) {
                logEvent('batch.progress', { batchId: id, generated: i + 1, total: limit });
            }
        }

        // Create ZIP file
        const zipStart = Date.now();
        const zipFile = await createZip(generatedFiles, id);
        logEvent('zip.complete', { batchId: id, zipFile, durationMs: Date.now() - zipStart });

        batch.status = 'completed';
        batch.items = generatedFiles;
        batch.zipFile = zipFile;
        batch.completedAt = new Date().toISOString();

        console.log(`[Batch] Generation complete: ${generatedFiles.length} certificates, ZIP: ${zipFile}`);

        res.json({
            message: `Generated ${generatedFiles.length} certificates`,
            status: 'completed',
            batchId: id,
            generatedCount: generatedFiles.length,
            totalCount: rows.length,
            zipFile: zipFile,
            zipUrl: `/generated/${zipFile}`,
            zipPath: path.join(process.cwd(), 'generated', zipFile),
            sample: generatedFiles.length > 0 ? `/generated/${generatedFiles[0]}` : null
        });

        logEvent('response.sent', { batchId: id, durationMs: Date.now() - reqStart });

    } catch (error) {
        console.error("[Batch] Generation error:", error);
        logEvent('response.error', { batchId: id, message: error.message, durationMs: Date.now() - reqStart });
        batch.status = 'failed';
        batch.error = error.message;
        res.status(500).json({ error: 'Generation failed', details: error.message });
    }
};

/**
 * Get batch status
 * GET /api/batches/:id/status
 */
exports.getBatchStatus = (req, res) => {
    const { id } = req.params;
    const batch = batches[id];

    console.log(`[Batch] Status check for batch ${id}:`, batch ? batch.status : 'not found');

    if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
        id: batch.id,
        status: batch.status,
        generatedCount: batch.generatedCount,
        totalCount: batch.totalCount,
        zipFile: batch.zipFile,
        zipUrl: batch.zipFile ? `/generated/${batch.zipFile}` : null,
        zipPath: batch.zipFile ? path.join(process.cwd(), 'generated', batch.zipFile) : null,
        items: batch.items,
        error: batch.error || null,
        createdAt: batch.createdAt,
        completedAt: batch.completedAt || null
    });
};

/**
 * Get first row preview data from uploaded file
 * POST /api/batches/preview-data
 * Body: { filename, mapping }
 */
exports.getPreviewData = async (req, res) => {
    const { filename, mapping } = req.body;

    console.log(`[Batch] Preview data request for file: ${filename}`);

    if (!filename) {
        return res.status(400).json({ error: 'No filename provided' });
    }

    try {
        const rows = await readFileData(filename);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'No data rows in file' });
        }

        const firstRow = rows[0];

        // Apply mapping if provided
        const previewData = {};
        if (mapping && Object.keys(mapping).length > 0) {
            for (const [templateField, sourceColumn] of Object.entries(mapping)) {
                previewData[templateField] = firstRow[sourceColumn] || '';
            }
        }

        // Also include raw first row
        Object.assign(previewData, firstRow);

        console.log(`[Batch] Preview data:`, previewData);

        res.json({
            rowData: previewData,
            totalRows: rows.length
        });

    } catch (error) {
        console.error('[Batch] Preview data error:', error);
        res.status(500).json({ error: 'Failed to read preview data', details: error.message });
    }
};
