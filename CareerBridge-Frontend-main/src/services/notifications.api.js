import apiClient from './apiClient';

export const notificationsApi = {
  getNotifications: async () => {
    return apiClient.get('/notifications');
  },

  getUnreadCount: async () => {
    return apiClient.get('/notifications/unread-count');
  },

  markRead: async (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllRead: async () => {
    return apiClient.patch('/notifications/read-all');
  },
};

export default notificationsApi;
