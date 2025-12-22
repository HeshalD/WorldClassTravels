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
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token is invalid/expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  adminLogin: (email, password) => api.post('/admin/login', { email, password }),
  adminLogout: () => api.post('/admin/logout'),
  getMe: () => api.get('/admin/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  verifyRegistrationOtp: (data) => api.post('/auth/verify-registration-otp', data),
  resendRegistrationOtp: (data) => api.post('/auth/resend-registration-otp', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  updateProfile: (userData) => api.patch('/auth/update-account', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email })
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
