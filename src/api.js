import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  const requestToken = error.config?.headers?.Authorization;
  const token = localStorage.getItem('token');
  const isSessionRequest = !error.config?.url?.startsWith('/api/auth/') || error.config.url === '/api/auth/me';
  if (error.response?.status === 401 && isSessionRequest && token && requestToken === `Bearer ${token}`) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('portal:session-expired'));
  }
  return Promise.reject(error);
});
export default api;
