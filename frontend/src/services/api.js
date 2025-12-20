import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  logout: () => api.post('/admin/logout'),
  getMe: () => api.get('/admin/me'),
};

// Visa API
export const visaAPI = {
  getAll: () => api.get('/visas'),
  getById: (id) => api.get(`/visas/${id}`),
  create: (visaData) => api.post('/visas', visaData),
  update: (id, visaData) => api.put(`/visas/${id}`, visaData),
  delete: (id) => api.delete(`/visas/${id}`),
};

// Ticket API
export const ticketAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  update: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/tickets/${id}`),
};

export default api;
