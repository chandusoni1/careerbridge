const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');

router.post('/build-resume', aiController.buildResume);
router.post('/enhance-section', aiController.enhanceSection);
router.post('/build-portfolio', aiController.buildPortfolio);

module.exports = router;
