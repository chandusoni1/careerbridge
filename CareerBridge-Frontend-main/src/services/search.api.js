import apiClient from './apiClient';

export const searchApi = {
  searchGlobal: async (query) => {
    return apiClient.get(`/search?q=${encodeURIComponent(query)}`);
  },
};

export default searchApi;
