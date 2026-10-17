const express = require('express');
const router = express.Router();
const directoryController = require('./directory.controller');
const authenticate = require('../../middleware/authenticate');

router.get('/alumni', directoryController.getAlumni);
router.get('/students', directoryController.getStudents);
router.get('/summary', authenticate, directoryController.getConnectionSummary);

// Connection endpoints protected with authentication
router.post('/connect/request', authenticate, directoryController.sendConnectRequest);
router.post('/connect/accept', authenticate, directoryController.acceptConnectRequest);
router.post('/connect/reject', authenticate, directoryController.rejectConnectRequest);
router.post('/connect/cancel', authenticate, directoryController.cancelConnectRequest);
router.post('/connect/remove', authenticate, directoryController.removeConnection);

module.exports = router;
