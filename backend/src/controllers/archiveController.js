const archiverService = require('../services/archiverService');
const fileStorageService = require('../services/fileStorageService');

const archiveController = {
    async archiveWebsite(req, res) {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }
            
            const result = await archiverService.archiveWebsite(url);
            res.json(result);
        } catch (error) {
            console.error('Error archiving website:', error);
            res.status(500).json({ error: 'Failed to archive website' });
        }
    },

    async getArchives(req, res) {
        try {
            const { domain } = req.params;
            const archives = await fileStorageService.getArchivesForDomain(domain);
            res.json(archives);
        } catch (error) {
            console.error('Error getting archives:', error);
            res.status(500).json({ error: 'Failed to get archives' });
        }
    },

    async getArchive(req, res) {
        try {
            const { domain, timestamp } = req.params;
            const archive = await fileStorageService.getArchive(domain, timestamp);
            if (!archive) {
                return res.status(404).json({ error: 'Archive not found' });
            }
            res.json(archive);
        } catch (error) {
            console.error('Error getting archive:', error);
            res.status(500).json({ error: 'Failed to get archive' });
        }
    }
};

module.exports = archiveController;
