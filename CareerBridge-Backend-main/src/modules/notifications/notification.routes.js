const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const authenticate = require('../../middleware/authenticate');

router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
