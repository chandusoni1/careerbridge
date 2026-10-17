import { apiClient } from '../../services/apiClient';

export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  signup: async (userData) => {
    return apiClient.post('/auth/signup', userData);
  },

  getUsers: async () => {
    return apiClient.get('/auth/users');
  },
};

export default authApi;
