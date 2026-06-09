// lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5001',
  // Note: /api mat daalo yahan. Routes already /tasks, /auth etc se start hote hain.
  headers: { 'Content-Type': 'application/json' },
});

// Token helper
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('accessToken') || localStorage.getItem('accessToken');
};

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean everything
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Avoid infinite redirect loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;