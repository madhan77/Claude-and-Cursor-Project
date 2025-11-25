import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Production Order API
export const productionOrderAPI = {
  getAll: (params?: any) => api.get('/production-orders', { params }),
  getById: (id: string) => api.get(`/production-orders/${id}`),
  create: (data: any) => api.post('/production-orders', data),
  update: (id: string, data: any) => api.put(`/production-orders/${id}`, data),
  delete: (id: string) => api.delete(`/production-orders/${id}`),
  getStats: () => api.get('/production-orders/stats'),
};
