import { apiClient } from '../../services/apiClient';

export const jobsApi = {
  getJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/jobs${query ? `?${query}` : ''}`);
  },

  getSavedJobs: async () => {
    return apiClient.get('/jobs/saved');
  },

  createJob: async (jobData) => {
    return apiClient.post('/jobs', jobData);
  },

  applyJob: async (jobId, studentId) => {
    return apiClient.post(`/jobs/${jobId}/apply`, { studentId });
  },

  toggleSaveJob: async (jobId) => {
    return apiClient.post(`/jobs/${jobId}/save`);
  },

  deleteJob: async (jobId) => {
    return apiClient.delete(`/jobs/${jobId}`);
  },
};

export default jobsApi;
