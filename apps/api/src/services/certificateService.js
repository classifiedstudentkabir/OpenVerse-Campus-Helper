const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Helper to replace placeholders
const replacePlaceholders = (text, data) => {
    if (!text) return '';
    return text.replace(/{(\w+)}/g, (_, key) => data[key] || '');
};

// Helper format text
const formatText = (text, layer) => {
    let result = text;
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
    try {
        const width = template.width || 800;
        const height = template.height || 600;
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
            fs.writeFileSync(outputPath, buffer);
            return outputPath;
        } else {
            return canvas.toBuffer('image/png');
        }

    } catch (error) {
        console.error("Errors in generation Service", error);
        throw error;
    }
};
