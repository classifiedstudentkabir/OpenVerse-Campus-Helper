const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { spawn } = require('child_process');

const DEFAULT_RENDER_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS || 30000);
const DEFAULT_PDF_TEMPLATE_TIMEOUT_MS = Number(process.env.PDF_TEMPLATE_TIMEOUT_MS || 45000);
const SAFE_MARGIN_BOTTOM = 24;
const SAFE_MARGIN_RIGHT = 24;

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

const logEvent = (event, data = {}) => {
    console.log(JSON.stringify({ at: new Date().toISOString(), scope: 'certificateService', event, ...data }));
};

// Helper to replace placeholders
const replacePlaceholders = (text, data) => {
    if (!text) return '';
    return text.replace(/{(\w+)}/g, (_, key) => data[key] || '');
};

// Helper format text
const formatText = (text, layer) => {
    // Ensure text is a string
    let result = String(text ?? '');
    if (layer.uppercase) {
        result = result.toUpperCase();
    }
    // Simple date format mock if needed, usage: dateFormat: true (iso) or specific string?
    // User requested "dateFormat" as optional. For MVP, if true/exists, assume they want a cleaner date string if it looks like a date.
    if (layer.dateFormat && !isNaN(Date.parse(result))) {
        // Simple default formatting YYYY-MM-DD
        try {
            result = new Date(result).toISOString().split('T')[0];
        } catch (e) { }
    }
    return result;
};

exports.generateCertificate = async (template, data, outputFilename) => {
    const start = Date.now();
    try {
        const width = template.width || 800;
        const height = template.height || 600;
        const ext = outputFilename ? path.extname(outputFilename).toLowerCase() : '.png';
        logEvent('render.start', { templateId: template.id || null, ext, width, height });

        // Check for PDF Template (Phase B)
        let isPdfTemplate = template.type === 'pdf';
        if (!isPdfTemplate && typeof template.background === 'object' && template.background.value && String(template.background.value).toLowerCase().endsWith('.pdf')) {
            isPdfTemplate = true;
        }

        if (isPdfTemplate) {
            return new Promise((resolve, reject) => {
                // Prepare config
                const resolvedLayers = (template.layers || []).map(layer => {
                    let content = '';
                    if (layer.key) content = data[layer.key] || '';
                    else if (layer.text) content = replacePlaceholders(layer.text, data);

                    content = formatText(content, layer);
                    return { ...layer, text: content };
                });

                const config = { layers: resolvedLayers };

                let bgValue = typeof template.background === 'object' ? template.background.value : template.background;
                let inputPath = bgValue;
                if (!path.isAbsolute(inputPath)) {
                    inputPath = path.join(process.cwd(), 'uploads', inputPath);
                }

                let destPath;
                let returnBuffer = false;
                if (outputFilename) {
                    destPath = path.join(process.cwd(), 'generated', outputFilename);
                } else {
                    returnBuffer = true;
                    // Temp file for buffer return (preview)
                    destPath = path.join(process.cwd(), 'generated', `temp_${Date.now()}_${Math.random()}.png`);
                }

                const scriptPath = path.join(process.cwd(), 'scripts', 'generate_pdf.py');
                logEvent('file.write.start', { outputPath: destPath, mode: 'pdf-template' });
                const pythonProcess = spawn('python', [scriptPath, inputPath, destPath, JSON.stringify(config)]);

                let stderrData = '';
                let stdoutData = '';

                const timeoutId = setTimeout(() => {
                    try { pythonProcess.kill('SIGKILL'); } catch (e) { }
                    reject(new Error(`pdf-template-render timed out after ${DEFAULT_PDF_TEMPLATE_TIMEOUT_MS}ms`));
                }, DEFAULT_PDF_TEMPLATE_TIMEOUT_MS);

                pythonProcess.stdout.on('data', (data) => stdoutData += data);
                pythonProcess.stderr.on('data', (data) => stderrData += data);

                pythonProcess.on('error', (err) => {
                    clearTimeout(timeoutId);
                    reject(err);
                });

                pythonProcess.on('close', (code) => {
                    clearTimeout(timeoutId);
                    if (code !== 0) {
                        console.error('Python Error:', stderrData);
                        return reject(new Error('Python script failed: ' + stderrData));
                    }

                    if (returnBuffer) {
                        try {
                            const buf = fs.readFileSync(destPath);
                            fs.unlinkSync(destPath);
                            logEvent('file.write.complete', { outputPath: destPath, mode: 'pdf-template' });
                            logEvent('render.complete', { buffer: true, durationMs: Date.now() - start, mode: 'pdf-template' });
                            resolve(buf);
                        } catch (e) { reject(e); }
                    } else {
                        logEvent('file.write.complete', { outputPath: destPath, mode: 'pdf-template' });
                        logEvent('render.complete', { outputPath: destPath, durationMs: Date.now() - start, mode: 'pdf-template' });
                        resolve(destPath);
                    }
                });
            });
        }


        // PDF Generation
        if (ext === '.pdf') {
            return new Promise(async (resolve, reject) => {
                try {
                    const doc = new PDFDocument({
                        size: [width, height],
                        margin: 0,
                        bufferPages: true
                    });

                    const clampY = (y, elementHeight) => Math.min(y, height - SAFE_MARGIN_BOTTOM - elementHeight);

                    logEvent('pdf.page.init', { width, height });

                    const outputPath = path.join(process.cwd(), 'generated', outputFilename);
                    logEvent('file.write.start', { outputPath, mode: 'pdf' });
                    const stream = fs.createWriteStream(outputPath);
                    doc.pipe(stream);

                    let settled = false;
                    const finish = (err) => {
                        if (settled) return;
                        settled = true;
                        if (err) return reject(err);
                        resolve(outputPath);
                    };

                    const timeoutId = setTimeout(() => {
                        try { doc.end(); } catch (e) { }
                        try { stream.destroy(); } catch (e) { }
                        finish(new Error(`pdf-render timed out after ${DEFAULT_RENDER_TIMEOUT_MS}ms`));
                    }, DEFAULT_RENDER_TIMEOUT_MS);

                    const onError = (err) => {
                        clearTimeout(timeoutId);
                        try { doc.end(); } catch (e) { }
                        finish(err);
                    };

                    doc.on('error', onError);
                    stream.on('error', onError);

                    // 1. Background
                    let bgType = 'color';
                    let bgValue = '#ffffff';

                    if (template.background) {
                        if (typeof template.background === 'object') {
                            bgType = template.background.type || 'color';
                            bgValue = template.background.value || '#ffffff';
                        } else if (typeof template.background === 'string') {
                            if (template.background.startsWith('#')) {
                                bgType = 'color';
                                bgValue = template.background;
                            } else {
                                bgType = 'image';
                                bgValue = template.background;
                            }
                        }
                    }

                    if (bgType === 'color') {
                        doc.rect(0, 0, width, height).fill(bgValue);
                    } else if (bgType === 'image') {
                        let bgPath = bgValue;
                        if (!path.isAbsolute(bgPath) && !bgPath.startsWith('http')) {
                            const uploadPath = path.join(process.cwd(), 'uploads', bgPath);
                            if (fs.existsSync(uploadPath)) {
                                bgPath = uploadPath;
                            }
                        }

                        // pdfkit needs a path or buffer. fetch if http
                        if (bgPath.startsWith('http')) {
                            // Fetch not implemented for simplicity, assume local for now or use buffer if needed
                            // For MVP assume local path
                            console.warn('Remote images not fully supported in PDF MVP yet, define local path');
                        } else if (fs.existsSync(bgPath)) {
                            doc.image(bgPath, 0, 0, { width, height });
                        } else {
                            doc.rect(0, 0, width, height).fill('#ffffff'); // Fallback
                        }
                    }

                    // 2. Layers
                    if (template.layers && Array.isArray(template.layers)) {
                        for (const layer of template.layers) {
                            if (layer.type === 'text') {
                                let content = '';
                                if (layer.key) {
                                    content = data[layer.key] || '';
                                } else if (layer.text) {
                                    content = replacePlaceholders(layer.text, data);
                                }
                                content = formatText(content, layer);

                                const fontSize = layer.fontSize || 20;
                                const fontFamily = layer.fontFamily || 'Helvetica'; // Standard font
                                const color = layer.color || '#000000';
                                const align = layer.align || 'left';
                                const rawX = layer.x || 0;
                                const rawY = layer.y || 0;

                                doc.font(fontFamily).fontSize(fontSize).fillColor(color);

                                const isCertificateId = String(layer.key || '').toLowerCase() === 'certificate_id'
                                    || String(layer.key || '').toLowerCase() === 'certificateid'
                                    || String(layer.text || '').includes('{certificate_id}')
                                    || String(layer.text || '').includes('{certificateId}');

                                let x = rawX;
                                let y = clampY(rawY, fontSize);
                                let textAlign = align === 'center' || align === 'right' ? align : undefined;

                                if (isCertificateId) {
                                    const textWidth = doc.widthOfString(content);
                                    x = width - SAFE_MARGIN_RIGHT - textWidth;
                                    y = clampY(height - SAFE_MARGIN_BOTTOM - fontSize, fontSize);
                                    textAlign = undefined;
                                }

                                // PDFKit text options
                                doc.text(content, x, y, {
                                    align: textAlign,
                                    lineBreak: false
                                    // width: undefined // could limit width
                                });

                            } else if (layer.type === 'image') {
                                // Image layer logic
                                let src = '';
                                if (layer.key) {
                                    src = data[layer.key] || '';
                                } else if (layer.src) {
                                    src = replacePlaceholders(layer.src, data);
                                }

                                if (src) {
                                    // Load image and draw
                                    // PDFKit supports paths
                                    if (fs.existsSync(src)) {
                                        const x = layer.x || 0;
                                        const rawY = layer.y || 0;
                                        const w = layer.w || 100;
                                        const h = layer.h || 100;
                                        const y = clampY(rawY, h);
                                        const clampedH = Math.max(0, Math.min(h, height - y));
                                        doc.image(src, x, y, { width: w, height: clampedH });
                                    }
                                }
                            }
                        }
                    }

                    const pageRange = doc.bufferedPageRange();
                    logEvent('pdf.page.count', { count: pageRange.count, start: pageRange.start, width, height });

                    doc.end();
                    stream.on('finish', () => {
                        clearTimeout(timeoutId);
                        logEvent('file.write.complete', { outputPath, mode: 'pdf' });
                        logEvent('render.complete', { outputPath, durationMs: Date.now() - start, mode: 'pdf' });
                        finish();
                    });

                } catch (e) {
                    reject(e);
                }
            });
        }

        // Canvas (PNG) Generation
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Background
        // Support old schema (string) and new schema ({ type, value })
        let bgType = 'color';
        let bgValue = '#ffffff';

        if (template.background) {
            if (typeof template.background === 'object') {
                bgType = template.background.type || 'color';
                bgValue = template.background.value || '#ffffff';
            } else if (typeof template.background === 'string') {
                if (template.background.startsWith('#')) {
                    bgType = 'color';
                    bgValue = template.background;
                } else {
                    bgType = 'image';
                    bgValue = template.background;
                }
            }
        }

        if (bgType === 'color') {
            ctx.fillStyle = bgValue;
            ctx.fillRect(0, 0, width, height);
        } else if (bgType === 'image') {
            try {
                let bgPath = bgValue;
                // If not absolute and not url, check uploads
                if (!path.isAbsolute(bgPath) && !bgPath.startsWith('http')) {
                    const uploadPath = path.join(process.cwd(), 'uploads', bgPath);
                    if (fs.existsSync(uploadPath)) {
                        bgPath = uploadPath;
                    }
                    // else it might be a relative path intended to be relative to cwd? Keep as is if exists.
                }

                // Allow fail-soft
                if (bgPath.startsWith('http') || fs.existsSync(bgPath)) {
                    const image = await loadImage(bgPath);
                    ctx.drawImage(image, 0, 0, width, height);
                } else {
                    console.warn(`Background image not found: ${bgValue}`);
                    ctx.fillStyle = '#ffffff'; // Fallback
                    ctx.fillRect(0, 0, width, height);
                }
            } catch (e) {
                console.error("Background load error", e);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
            }
        }

        // 2. Layers
        if (template.layers && Array.isArray(template.layers)) {
            for (const layer of template.layers) {
                if (layer.type === 'text') {
                    // Logic: uses 'key' if present (data binding), else 'text' (static or mixed)
                    let content = '';
                    if (layer.key) {
                        // Direct binding, e.g. key="name" -> data["name"]
                        content = data[layer.key] || '';
                        // If empty and text exists, maybe fallback? Or just use text as template?
                        // User spec: key: "name". So we map data.name.
                    } else if (layer.text) {
                        content = replacePlaceholders(layer.text, data);
                    }

                    content = formatText(content, layer);

                    const fontSize = layer.fontSize || 20;
                    const fontWeight = layer.fontWeight || 'normal';
                    const fontFamily = layer.fontFamily || 'Arial';
                    const color = layer.color || '#000000';
                    const align = layer.align || 'left';
                    const x = layer.x || 0;
                    const y = layer.y || 0;

                    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                    ctx.fillStyle = color;
                    ctx.textAlign = align;
                    ctx.fillText(content, x, y);

                } else if (layer.type === 'image') {
                    // Image layer logic
                    let src = '';
                    if (layer.key) {
                        src = data[layer.key] || '';
                    } else if (layer.src) {
                        src = replacePlaceholders(layer.src, data);
                    }

                    if (src) {
                        try {
                            const imgConf = {
                                x: layer.x || 0,
                                y: layer.y || 0,
                                w: layer.w || 100,
                                h: layer.h || 100
                            };
                            const img = await loadImage(src);
                            ctx.drawImage(img, imgConf.x, imgConf.y, imgConf.w, imgConf.h);
                        } catch (e) {
                            console.error(`Failed to load layer image: ${src}`, e.message);
                        }
                    }
                }
            }
        }

        if (outputFilename) {
            const buffer = canvas.toBuffer('image/png');
            const outputPath = path.join(process.cwd(), 'generated', outputFilename);
            logEvent('file.write.start', { outputPath, mode: 'png' });
            fs.writeFileSync(outputPath, buffer);
            logEvent('file.write.complete', { outputPath, mode: 'png' });
            logEvent('render.complete', { outputPath, durationMs: Date.now() - start });
            return outputPath;
        } else {
            const buf = canvas.toBuffer('image/png');
            logEvent('render.complete', { buffer: true, durationMs: Date.now() - start });
            return buf;
        }

    } catch (error) {
        logEvent('render.error', { message: error.message, durationMs: Date.now() - start });
        console.error("Errors in generation Service", error);
        throw error;
    }
};
