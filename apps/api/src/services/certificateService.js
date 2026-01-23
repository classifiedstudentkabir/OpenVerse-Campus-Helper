const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Helper to replace placeholders
const replacePlaceholders = (text, data) => {
    if (!text) return '';
    return text.replace(/{(\w+)}/g, (_, key) => data[key] || '');
};

exports.generateCertificate = async (template, data, outputFilename) => {
    try {
        const width = template.width || 800;
        const height = template.height || 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Background
        if (template.background) {
            if (template.background.startsWith('#')) {
                ctx.fillStyle = template.background;
                ctx.fillRect(0, 0, width, height);
            } else {
                // Assume it's a URL or path to an uploaded image
                // For MVP, we might treat it as a path in uploads or a public URL if we had one.
                // If it doesn't resolve, fallback to white.
                try {
                    // Clean up path - if it's just a filename, look in uploads.
                    // If absolute, use it.
                    let bgPath = template.background;
                    if (!path.isAbsolute(bgPath) && !bgPath.startsWith('http')) {
                        bgPath = path.join(process.cwd(), 'uploads', template.background);
                    }

                    if (fs.existsSync(bgPath)) {
                        const image = await loadImage(bgPath);
                        ctx.drawImage(image, 0, 0, width, height);
                    } else {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, width, height);
                    }
                } catch (e) {
                    console.error("Background load error", e);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                }
            }
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Layers
        if (template.layers && Array.isArray(template.layers)) {
            for (const layer of template.layers) {
                if (layer.type === 'text') {
                    const text = replacePlaceholders(layer.text, data);
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
                    ctx.fillText(text, x, y);

                } else if (layer.type === 'image') {
                    // Basic image layer support (e.g. signature or loose image)
                    // If the src is a placeholder (e.g. {signature_url}), substitute it
                    let src = replacePlaceholders(layer.src, data);

                    if (src) {
                        try {
                            const imgConf = {
                                x: layer.x || 0,
                                y: layer.y || 0,
                                w: layer.w || 100,
                                h: layer.h || 100
                            };
                            // Check if src is web url or local
                            // For MVP, if it starts with http, we try to load it (canvas supports it if built with libcurl, but safer to stick to local or simple URIs? 
                            // default canvas loading handles http if network is allowed).
                            // We'll treat it as local if not http.
                            // NOTE: For 'signature_url' in CSV, it might be a remote URL. node-canvas loadImage handles URLs.
                            const img = await loadImage(src);
                            ctx.drawImage(img, imgConf.x, imgConf.y, imgConf.w, imgConf.h);
                        } catch (e) {
                            console.error(`Failed to load layer image: ${src}`, e.message);
                        }
                    }
                }
            }
        }

        // Return Buffer or Path?
        // Service usually saves to file, but for preview we might want Buffer.
        // Let's modify signature to support returning Buffer if no filename is passed?
        // Or keep it simple: if outputFilename provided, save and return path. If null, return buffer.

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
