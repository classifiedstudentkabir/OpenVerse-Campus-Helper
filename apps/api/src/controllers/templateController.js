const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data', 'templates.json');

// Helper to read/write
const getTemplates = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
};

const saveTemplates = (templates) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(templates, null, 2));
};

// Initialize with a default template if empty
if (!fs.existsSync(DATA_FILE)) {
    saveTemplates([{
        id: "default-1",
        name: "Simple Certificate",
        width: 800,
        height: 600,
        background: "#f0f0f0",
        layers: [
            { type: "text", text: "CERTIFICATE OF ACHIEVEMENT", x: 400, y: 100, fontSize: 40, fontWeight: "bold", color: "#000000", align: "center" },
            { type: "text", text: "This is presented to", x: 400, y: 200, fontSize: 24, fontWeight: "normal", color: "#333333", align: "center" },
            { type: "text", text: "{name}", x: 400, y: 300, fontSize: 48, fontWeight: "bold", color: "#2c3e50", align: "center" },
            { type: "text", text: "For participating in {event}", x: 400, y: 400, fontSize: 20, fontWeight: "normal", color: "#555555", align: "center" },
            { type: "text", text: "Date: {date}", x: 400, y: 500, fontSize: 16, fontWeight: "normal", color: "#555555", align: "center" },
            { type: "text", text: "ID: {certificate_id}", x: 750, y: 580, fontSize: 12, fontWeight: "normal", color: "#999999", align: "right" }
        ]
    }]);
}

exports.getAll = (req, res) => {
    const templates = getTemplates();
    res.json(templates);
};

exports.getById = (req, res) => {
    const templates = getTemplates();
    const template = templates.find(t => t.id === req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
};

exports.create = (req, res) => {
    const templates = getTemplates();
    const newTemplate = {
        id: Date.now().toString(),
        ...req.body
    };
    templates.push(newTemplate);
    saveTemplates(templates);
    res.status(201).json(newTemplate);
};

exports.update = (req, res) => {
    const templates = getTemplates();
    const index = templates.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Template not found' });

    templates[index] = { ...templates[index], ...req.body, id: req.params.id };
    saveTemplates(templates);
    res.json(templates[index]);
};
