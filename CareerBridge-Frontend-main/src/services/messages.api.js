import apiClient from './apiClient';

export const messagesApi = {
  getConversations: async () => {
    return apiClient.get('/messages/conversations');
  },

  getOrCreateConversation: async (targetUserId) => {
    return apiClient.get(`/messages/conversation/with/${targetUserId}`);
  },

  getMessages: async (conversationId) => {
    return apiClient.get(`/messages/${conversationId}`);
  },

  sendMessage: async ({ receiverId, text, conversationId, attachments = [] }) => {
    return apiClient.post('/messages', {
      receiverId,
      text,
      conversationId,
      attachments,
    });
  },

  getPresence: async (targetUserId) => {
    return apiClient.get(`/messages/presence/${targetUserId}`);
  },

  markRead: async (conversationId) => {
    return apiClient.patch(`/messages/${conversationId}/read`);
  },

  markDelivered: async (messageId) => {
    return apiClient.patch(`/messages/${messageId}/delivered`);
  },
};

export default messagesApi;
