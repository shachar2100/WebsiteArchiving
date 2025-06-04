// backend/src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { AUTO_ARCHIVE_INTERVAL_MS } = require('../config');

const archiveRoutes = require('./routes/archiveRoutes');
const fileStorageService = require('./services/fileStorageService');
const archiverService = require('./services/archiverService');

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




const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/**
 * Automatically archives websites that haven't been archived in over a week.
 * This function:
 * 1. Gets all domains in the archive
 * 2. For each domain, checks if the latest archive is older than a week
 * 3. If so, triggers a new archive of that domain
 * 
 * The function is called:
 * - On server startup
 * - Every 12 hours via setInterval
 * 
 * @returns {Promise<void>}
 */

async function autoArchiveIfNeeded() {
  const domains = await fileStorageService.getAllDomains();
  for (const domain of domains) {
    const archives = await fileStorageService.getArchivesForDomain(domain);
    if (archives.length === 0) continue;
    const latest = archives[0]; // sorted by newest first
    const now = Date.now();
    if (now - latest.timestamp > ONE_WEEK_MS) {
      const url = `https://${domain}`;
      try {
        console.log(`[Auto-Archive] Archiving ${url} (last archive was over a week ago)`);
        await archiverService.archiveWebsite(url);
      } catch (err) {
        console.error(`[Auto-Archive] Failed to archive ${url}:`, err.message);
      }
    }
  }
}

// Run every 12 hours (or as you wish)
setInterval(autoArchiveIfNeeded, AUTO_ARCHIVE_INTERVAL_MS);
// Optionally, run once on startup
autoArchiveIfNeeded();