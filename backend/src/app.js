// backend/src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const archiveRoutes = require('./routes/archiveRoutes');
const fileStorageService = require('./services/fileStorageService');

const app = express();

app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/archives', archiveRoutes);

// Serve static files from the archives directory
app.use('/snapshots', express.static(path.join(__dirname, '../archives')));

// --- Static Serving for Archived Content ---
app.use('/snapshots', express.static(path.join(__dirname, '../archives')));

// --- Serve Frontend Files ---
// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});