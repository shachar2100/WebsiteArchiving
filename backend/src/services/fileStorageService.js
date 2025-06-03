// backend/src/services/fileStorageService.js
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

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
         * @returns {Promise<Array<{timestamp: number, path: string}>>} Array of archive information.
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

            // Sort archives by timestamp (newest first)
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
}
module.exports = new FileStorageService();