import { API_BASE_URL } from '../constants';
import { storage } from '../utils';

export const uploadService = {
  async uploadFile(endpoint, file, fieldName = 'file') {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = storage.getToken();

    const formData = new FormData();
    formData.append(fieldName, file);

    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }

    return data;
  },
};

export default uploadService;
