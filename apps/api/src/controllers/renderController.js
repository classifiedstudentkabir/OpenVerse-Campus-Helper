const certificateService = require('../services/certificateService');
const fs = require('fs');
const path = require('path');

const DEFAULT_PREVIEW_TIMEOUT_MS = Number(process.env.PREVIEW_TIMEOUT_MS || 15000);

const logEvent = (event, data = {}) => {
    console.log(JSON.stringify({ at: new Date().toISOString(), scope: 'renderController', event, ...data }));
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
    const reqStart = Date.now();
    try {
        const { templateId, rowData } = req.body;
        logEvent('request.received', { route: 'preview', templateId: templateId || null });

        let template = null;
        if (templateId) {
            const tStart = Date.now();
            template = getTemplateById(templateId);
            logEvent('template.fetch', { templateId, durationMs: Date.now() - tStart, found: !!template });
        }

        // If passed explicit template object in body (for live editing), usage that
        if (req.body.template) {
            template = req.body.template;
        }

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Generate buffer
        const renderStart = Date.now();
        const buffer = await withTimeout(
            certificateService.generateCertificate(template, rowData || {}, null),
            DEFAULT_PREVIEW_TIMEOUT_MS,
            'preview-render'
        );
        logEvent('render.complete', { templateId: templateId || template.id || null, durationMs: Date.now() - renderStart });

        res.set('Content-Type', 'image/png');
        res.send(buffer);
        logEvent('response.sent', { route: 'preview', durationMs: Date.now() - reqStart });

    } catch (error) {
        console.error("Preview error", error);
        logEvent('response.error', { route: 'preview', message: error.message, durationMs: Date.now() - reqStart });
        res.status(500).json({ error: 'Failed to generate preview' });
    }
};
