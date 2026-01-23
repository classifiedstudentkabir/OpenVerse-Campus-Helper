const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

exports.handleUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    const results = [];
    let headers = [];

    if (fileExt === '.csv') {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (headerList) => {
                headers = headerList;
            })
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Return analysis
                res.json({
                    message: 'File processed successfully',
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    rowCount: results.length,
                    headers: headers,
                    preview: results.slice(0, 3) // Return first 3 rows as preview
                });
                // In a real app we might save 'results' to DB or keep file for batch processing
            })
            .on('error', (err) => {
                res.status(500).json({ error: 'Error processing CSV file' });
            });
    } else if (fileExt === '.xlsx') {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Header array of arrays

            if (data.length > 0) {
                headers = data[0];
                const rowCount = data.length - 1; // Minus header
                res.json({
                    message: 'File processed successfully',
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    rowCount: Math.max(0, rowCount),
                    headers: headers,
                    preview: data.slice(1, 4) // Rows 1-3
                });
            } else {
                res.json({ message: 'Empty XLSX file', headers: [], rowCount: 0 });
            }
        } catch (err) {
            res.status(500).json({ error: 'Error processing XLSX file' });
        }
    } else {
        // Should be caught by multer filter, but double check
        fs.unlinkSync(filePath); // Delete invalid file
        res.status(400).json({ error: 'Invalid file type' });
    }
};
