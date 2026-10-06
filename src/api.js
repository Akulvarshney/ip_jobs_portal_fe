import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
const pendingGets = new Map();
const axiosGet = api.get.bind(api);

// React Strict Mode can replay mount effects in development. Share identical
// in-flight reads so the backend receives one request for the same resource.
api.get = (url, config = {}) => {
  if (config.signal || config.cancelToken) return axiosGet(url, config);
  const token = localStorage.getItem('token') || '';
  const key = `${token}|${api.getUri({ ...config, url })}`;
  const pending = pendingGets.get(key);
  if (pending) return pending;

  const request = axiosGet(url, config);
  pendingGets.set(key, request);
  const clear = () => {
    if (pendingGets.get(key) === request) pendingGets.delete(key);
  };
  request.then(clear, clear);
  return request;
};
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
