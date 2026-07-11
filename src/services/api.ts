import axios from 'axios';

// Use env variable or fallback to production
export const API_URL = import.meta.env.VITE_API_URL || 'https://popli-backend.onrender.com';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // Redirect to login handled at router level
    }
    return Promise.reject(error);
  }
);
