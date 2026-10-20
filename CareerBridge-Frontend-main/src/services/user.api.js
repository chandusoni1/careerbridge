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

  resubmitCollegeId: async (idCardData) => {
    return apiClient.post('/users/profile/me/resubmit-id', { collegeIdCard: idCardData });
  },

  getAdminVerifications: async () => {
    return apiClient.get('/users/admin/verifications');
  },

  getAdminCollegeIdCard: async (userId) => {
    return apiClient.get(`/users/admin/verifications/${userId}/id-card`);
  },

  decideVerification: async (userId, decisionData) => {
    return apiClient.post(`/users/admin/verifications/${userId}`, decisionData);
  },
};

export default userApi;
