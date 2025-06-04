const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');
const Diff = require('diff');
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

class FileStorageService {
    constructor() {
        // Base directory for all archives (e.g., backend/archives)
        this.archivesBaseDir = path.join(__dirname, '../../archives');
    }

    /**
     * Constructs the full path for a file within an archive.
     * @param {string} domain - The domain of the website (e.g., 'example.com').
     * @param {number} timestamp - The timestamp of the archive.
     * @param {string} filePath - The original path relative to the domain (e.g., '/css/style.css').
     * @returns {string} The full local file path.
     */
    getArchiveFilePath(domain, timestamp, filePath) {
        // Ensure filePath is relative and clean (e.g., remove leading slash if present for path.join)
        const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        // Construct the full path
        return path.join(this.archivesBaseDir, domain, String(timestamp), relativePath);
    }

    /**
     * Saves content to a specific path within an archive. Creates directories as needed.
     * @param {string} fullPath - The absolute path where the file should be saved.
     * @param {Buffer | string} content - The content to save.
     */
    async saveFile(fullPath, content) {
        try {
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true }); // Ensure directory exists
            await fs.writeFile(fullPath, content);
            // console.log(`Saved: ${fullPath}`);
        } catch (error) {
            console.error(`Error saving file to ${fullPath}:`, error.message);
            throw error;
        }
    }

    /**
     * Serves an archived file. (Used by Express static serving, but could be used directly for specific files).
     * @param {string} domain
     * @param {number} timestamp
     * @param {string} relativePath - The path within the archived snapshot (e.g., 'index.html', 'css/style.css').
     * @returns {string} The absolute path to the archived file.
     */
    getServedFilePath(domain, timestamp, relativePath) {
        const cleanedRelativePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        return path.join(this.archivesBaseDir, domain, String(timestamp), cleanedRelativePath);
    }
        
    /**
         * Gets all archives for a specific domain.
         * @param {string} domain - The domain to get archives for.
         * @returns {Promise<Array<{timestamp: number, path: string, changed?: boolean}>>} Array of archive information.
         */
    async getArchivesForDomain(domain) {
        try {
            const domainPath = path.join(this.archivesBaseDir, domain);
            // Check if domain directory exists
            try {
                await fs.access(domainPath);
            } catch (error) {
                // If directory doesn't exist, return empty array
                return [];
            }
            // Get all timestamp directories
            const entries = await fs.readdir(domainPath, { withFileTypes: true });
            const archives = [];
            // Process each timestamp directory
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const timestamp = parseInt(entry.name);
                    if (!isNaN(timestamp)) {
                        archives.push({
                            timestamp: timestamp,
                            path: path.join(domain, entry.name)
                        });
                    }
                }
            }
            // Sort archives by timestamp (oldest first for comparison)
            archives.sort((a, b) => a.timestamp - b.timestamp);
            // Read contents for each archive's main file (index/index.html)
            const contents = [];
            for (const archive of archives) {
                const mainFilePath = path.join(this.archivesBaseDir, archive.path, 'index', 'index.html');
                try {
                    const content = await fs.readFile(mainFilePath, 'utf8');
                    contents.push(content);
                } catch (err) {
                    contents.push(null);
                }
            }
            // Add percentDifference property
            for (let i = 0; i < archives.length; i++) {
                if (i === 0 || !contents[i] || !contents[i-1]) {
                    archives[i].percentDifference = 0;
                } else {
                    const diff = Diff.diffWords(contents[i-1], contents[i]);
                    let total = 0, changed = 0;
                    diff.forEach(part => {
                        total += part.value.length;
                        if (part.added || part.removed) changed += part.value.length;
                    });
                    archives[i].percentDifference = total === 0 ? 0 : (changed / total) * 100;
                }
            }
            // Add 'changed' property: true if percentDifference > 0
            for (let i = 0; i < archives.length; i++) {
                archives[i].changed = archives[i].percentDifference > 0;
            }
            // Return sorted by newest first (as before)
            return archives.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error(`Error getting archives for domain ${domain}:`, error);
            throw error;
        }
    }

    /**
     * Gets a specific archive.
     * @param {string} domain - The domain of the archive.
     * @param {number} timestamp - The timestamp of the archive.
     * @returns {Promise<{timestamp: number, path: string} | null>} Archive information or null if not found.
     */
    async getArchive(domain, timestamp) {
        try {
            const archivePath = path.join(this.archivesBaseDir, domain, String(timestamp));
            
            // Check if archive exists
            try {
                await fs.access(archivePath);
            } catch (error) {
                return null;
            }

            return {
                timestamp: timestamp,
                path: path.join(domain, String(timestamp))
            };
        } catch (error) {
            console.error(`Error getting archive for ${domain} at ${timestamp}:`, error);
            throw error;
        }
    }

    /**
     * Gets all domains in the archives directory.
     * @returns {Promise<Array<string>>} Array of domain names.
     */
    async getAllDomains() {
        try {
            const entries = await fs.readdir(this.archivesBaseDir, { withFileTypes: true });
            console.log('entries:', entries);
            return entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name)
                .sort((a, b) => a.localeCompare(b));
        } catch (err) {
            // If the directory doesn't exist, return an empty array
            if (err.code === 'ENOENT') return [];
            throw err;
        }
    }
}
// /**
//  * Gets the color of the difference between two versions of a website.
//  * @param {number} percent - The percentage of the difference.
//  * @returns {string} The color of the difference.
//  */
// function getDiffColor(percent) {
//     if (percent === 0) return '#d6d6d6'; // gray
//     if (percent <= 20) return '#f6e58d'; // yellow
//     if (percent <= 50) return '#badc58'; // light green
//     if (percent <= 80) return '#6ab04c'; // green
//     return '#30336b'; // blue
// }




module.exports = new FileStorageService();