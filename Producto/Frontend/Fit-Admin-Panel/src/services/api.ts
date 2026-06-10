import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta el JWT en cada request automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;