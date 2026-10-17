const notificationService = require('./notification.service');
const asyncHandler = require('../../utils/asyncHandler');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(
    req.user.id
  );
  res.status(200).json(notifications);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);
  res.status(200).json(result);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(
    req.params.id,
    req.user.id
  );
  res.status(200).json(notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user.id);
  res.status(200).json(result);
});

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
