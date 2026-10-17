import apiClient from './apiClient';

export const aiApi = {
  buildResume: async (data) => {
    return apiClient.post('/ai/build-resume', data);
  },

  enhanceSection: async (sectionType, text, context = '') => {
    return apiClient.post('/ai/enhance-section', { sectionType, text, context });
  },

  buildPortfolio: async (data) => {
    return apiClient.post('/ai/build-portfolio', data);
  },
};

export default aiApi;
