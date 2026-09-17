import axios from 'axios';

// Base URL fetched from frontend environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor: attach token & log outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Console logging for outgoing API request
    const method = config.method ? config.method.toUpperCase() : 'GET';
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;

    console.groupCollapsed(
      `%c🚀 [API Request] ${method} %c${fullUrl}`,
      'color: #38bdf8; font-weight: bold; background: rgba(14, 165, 233, 0.15); padding: 2px 6px; border-radius: 4px;',
      'color: #ffffff; font-weight: 500;'
    );
    console.log('🔗 URL:', fullUrl);
    console.log('📝 Method:', method);
    if (config.params) console.log('🔍 Query Params:', config.params);
    if (config.data) console.log('📦 Payload Data:', config.data);
    if (token) console.log('🔑 Auth Token:', `Bearer ${token.substring(0, 12)}...`);
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor: log incoming responses and errors
api.interceptors.response.use(
  (response) => {
    const method = response.config?.method ? response.config.method.toUpperCase() : 'GET';
    const url = response.config?.url || '';
    const status = response.status;

    console.groupCollapsed(
      `%c✅ [API Response ${status}] %c${method} ${url}`,
      'color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 4px;',
      'color: #ffffff; font-weight: 500;'
    );
    console.log('📊 Status:', status, response.statusText);
    console.log('📥 Response Data:', response.data);
    console.log('⏱️ Full Response Object:', response);
    console.groupEnd();

    return response;
  },
  (error) => {
    const method = error.config?.method ? error.config.method.toUpperCase() : 'UNKNOWN';
    const url = error.config?.url || '';
    const status = error.response ? error.response.status : 'NETWORK_ERROR';

    console.group(
      `%c❌ [API Error ${status}] %c${method} ${url}`,
      'color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px;',
      'color: #ffffff; font-weight: 500;'
    );
    console.error('⚠️ Error Message:', error.message);
    if (error.response?.data) {
      console.error('📦 Server Response:', error.response.data);
    }
    console.groupEnd();

    return Promise.reject(error);
  }
);

export default api;
