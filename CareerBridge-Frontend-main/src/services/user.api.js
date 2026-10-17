import apiClient from './apiClient';

export const userApi = {
  getMyProfile: async () => {
    return apiClient.get('/users/profile/me');
  },

  updateMyProfile: async (profileData) => {
    return apiClient.put('/users/profile/me', profileData);
  },

  getUserById: async (userId) => {
    return apiClient.get(`/users/${userId}`);
  },

  getDashboardSummary: async () => {
    return apiClient.get('/users/dashboard/summary');
  },

  getAdminStats: async () => {
    return apiClient.get('/users/stats/admin');
  },
};

export default userApi;
