import { apiClient } from '../../services/apiClient';
import { storage } from '../../utils';

export const directoryApi = {
  getUsers: async () => {
    return apiClient.get('/auth/users');
  },

  sendConnectRequest: async ({ senderId, receiverId }) => {
    const user = storage.getUser();
    return apiClient.post('/directory/connect/request', {
      senderId: senderId || user?._id || user?.id,
      receiverId,
    });
  },
};

export default directoryApi;
