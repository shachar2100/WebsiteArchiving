const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const fileStorageService = require('../services/fileStorageService');

// Route to get all domains
router.get('/domains', async (req, res) => {
  try {
    console.log('domains:');
   
    const domains = await fileStorageService.getAllDomains();
    console.log('domains:', domains);
    res.json(domains);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list domains' });
  }
});




// Route to archive a website
router.post('/archive', archiveController.archiveWebsite);

// Route to get all archives for a domain
router.get('/:domain', archiveController.getArchives);

// Route to get a specific archive
router.get('/:domain/:timestamp', archiveController.getArchive);




module.exports = router;
