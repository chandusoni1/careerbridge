const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const authenticate = require('../../middleware/authenticate');

router.use(authenticate);

router.get('/conversations', messageController.getConversations);
router.get('/presence/:targetUserId', messageController.getUserPresence);
router.get('/conversation/with/:targetUserId', messageController.getOrCreate);
router.get('/:conversationId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.patch('/:conversationId/read', messageController.markRead);

module.exports = router;
