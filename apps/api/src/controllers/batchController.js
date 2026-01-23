const certificateService = require('../services/certificateService');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

// Mock db
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
        if (!fs.existsSync(filePath)) {
            // Fallback for demo if file validation mocked
            if (filename === 'sample_certifyneo.csv') {
                // return sample data 
                const p = path.join(process.cwd(), 'sample_certifyneo.csv');
                const results = [];
                fs.createReadStream(p)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', reject);
                return;
            }
            return reject(new Error('File not found'));
        }

        const ext = path.extname(filename).toLowerCase();
        if (ext === '.csv') {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', reject);
        } else if (ext === '.xlsx') {
            try {
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet);
                resolve(data);
            } catch (e) {
                reject(e);
            }
        } else {
            reject(new Error('Unsupported file type'));
        }
    });
};

exports.createBatch = (req, res) => {
    // Body: { filename, templateId }
    const id = 'batch_' + Date.now();
    batches[id] = {
        id,
        status: 'pending',
        items: [],
        filename: req.body.filename,
        templateId: req.body.templateId
    };
    res.status(201).json({ message: 'Batch created', batchId: id });
};

exports.generateBatch = async (req, res) => {
    const { id } = req.params;
    const batch = batches[id];

    if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
    }

    // Allow overriding templateId or filename in generate call if not in batch
    const templateId = req.body.templateId || batch.templateId;
    const filename = req.body.filename || batch.filename || 'sample_certifyneo.csv'; // Default for demo

    const template = getTemplateById(templateId);
    if (!template) {
        return res.status(400).json({ error: 'Template not found (ID: ' + templateId + ')' });
    }

    try {
        console.log(`Starting generation for batch ${id} with template ${template.name} and file ${filename}`);
        batch.status = 'processing';

        const rows = await readFileData(filename);
        const generatedFiles = [];

        // Generate for each row
        // Basic limitation for demo: limit to 20 rows to avoid timeout if sync
        const limit = Math.min(rows.length, 20);

        for (let i = 0; i < limit; i++) {
            const row = rows[i];
            // Safe filename generation using some ID or name
            const safeName = (row.name || 'cert').replace(/[^a-z0-9]/gi, '_');
            const outFile = `cert_${id}_${safeName}_${i}.png`;

            await certificateService.generateCertificate(template, row, outFile);
            generatedFiles.push({ file: outFile, data: row });
        }

        batch.status = 'completed';
        batch.items = generatedFiles;

        res.json({
            message: `Generated ${generatedFiles.length} certificates`,
            status: 'completed',
            generatedCount: generatedFiles.length,
            sample: `/generated/${generatedFiles[0].file}`
        });

    } catch (error) {
        console.error("Batch generation error", error);
        batch.status = 'failed';
        res.status(500).json({ error: 'Generation failed', details: error.message });
    }
};

exports.getBatchStatus = (req, res) => {
    const { id } = req.params;
    const batch = batches[id];
    if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
};
