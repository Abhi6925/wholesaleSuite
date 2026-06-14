import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Auto-inject JWT auth token on every outbound request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wholesale_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
