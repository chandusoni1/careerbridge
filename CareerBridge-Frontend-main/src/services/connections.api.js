import apiClient from './apiClient';
import { storage } from '../utils';

export const connectionsApi = {
  getSummary: async () => {
    return apiClient.get('/directory/summary');
  },

  sendRequest: async (receiverId) => {
    const user = storage.getUser();
    return apiClient.post('/directory/connect/request', {
      receiverId,
      senderId: user?._id || user?.id,
    });
  },

  acceptRequest: async (targetUserId) => {
    const user = storage.getUser();
    return apiClient.post('/directory/connect/accept', {
      targetUserId,
      userId: user?._id || user?.id,
    });
  },

  rejectRequest: async (targetUserId) => {
    const user = storage.getUser();
    return apiClient.post('/directory/connect/reject', {
      targetUserId,
      userId: user?._id || user?.id,
    });
  },

  cancelRequest: async (targetUserId) => {
    const user = storage.getUser();
    return apiClient.post('/directory/connect/cancel', {
      targetUserId,
      senderId: user?._id || user?.id,
    });
  },

  removeConnection: async (targetUserId) => {
    const user = storage.getUser();
    return apiClient.post('/directory/connect/remove', {
      targetUserId,
      userId: user?._id || user?.id,
    });
  },
};

export default connectionsApi;
