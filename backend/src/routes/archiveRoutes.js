const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');

// Route to archive a website
router.post('/archive', archiveController.archiveWebsite);

// Route to get all archives for a domain
router.get('/:domain', archiveController.getArchives);

// Route to get a specific archive
router.get('/:domain/:timestamp', archiveController.getArchive);

module.exports = router;
