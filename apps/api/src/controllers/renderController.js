const certificateService = require('../services/certificateService');
const fs = require('fs');
const path = require('path');

// Helper: load template from file-based store
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

exports.preview = async (req, res) => {
    try {
        const { templateId, rowData } = req.body;

        let template = null;
        if (templateId) {
            template = getTemplateById(templateId);
        }

        // If passed explicit template object in body (for live editing), usage that
        if (req.body.template) {
            template = req.body.template;
        }

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Generate buffer
        const buffer = await certificateService.generateCertificate(template, rowData || {}, null);

        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error("Preview error", error);
        res.status(500).json({ error: 'Failed to generate preview' });
    }
};
