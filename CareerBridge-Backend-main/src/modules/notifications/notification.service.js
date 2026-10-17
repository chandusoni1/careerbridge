const { Notification } = require('./notification.model');
const ApiError = require('../../utils/ApiError');

const getUserNotifications = async (userId) => {
  return Notification.find({ recipient: userId })
    .populate('sender', 'name role profilePhoto headline')
    .sort({ createdAt: -1 })
    .limit(50);
};

const markNotificationRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  notification.read = true;
  await notification.save();
  return notification;
};

const markAllNotificationsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );
  return { message: 'All notifications marked as read' };
};

const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });
  return { unreadCount: count };
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
};
