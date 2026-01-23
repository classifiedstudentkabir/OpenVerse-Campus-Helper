require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure directories exist
const dirs = ['uploads', 'generated', 'logs', 'data'];
dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const batchRoutes = require('./src/routes/batchRoutes');
const templateRoutes = require('./src/routes/templateRoutes');
const renderRoutes = require('./src/routes/renderRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/render', renderRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'CertifyNeo API is running 🚀' });
});

// Serve generated files for easy access (dev only, usually guarded)
app.use('/generated', express.static(path.join(process.cwd(), 'generated')));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Storage Path: ${process.env.STORAGE_PATH || process.cwd()}`);
});
