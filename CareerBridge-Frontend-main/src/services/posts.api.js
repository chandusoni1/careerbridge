import apiClient from './apiClient';

export const postsApi = {
  getPosts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/posts${query ? `?${query}` : ''}`);
  },

  createPost: async (postData) => {
    return apiClient.post('/posts', postData);
  },

  toggleLike: async (postId) => {
    return apiClient.post(`/posts/${postId}/like`);
  },

  addComment: async (postId, text) => {
    return apiClient.post(`/posts/${postId}/comment`, { text });
  },

  deleteComment: async (postId, commentId) => {
    return apiClient.delete(`/posts/${postId}/comment/${commentId}`);
  },

  sharePost: async (postId) => {
    return apiClient.post(`/posts/${postId}/share`);
  },

  deletePost: async (postId) => {
    return apiClient.delete(`/posts/${postId}`);
  },
};

export default postsApi;
