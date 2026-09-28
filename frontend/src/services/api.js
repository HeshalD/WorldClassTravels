import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attaches the correct token as Authorization: Bearer
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');

    // Admin token takes priority
    const token = adminToken || userToken;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect on 401 only for non-login routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLoginRoute = url.includes('/login');

    // Never redirect if the 401 came from a login attempt —
    // that just means wrong credentials and the form should show the toast
    if (error.response?.status === 401 && !isLoginRoute) {
      const adminToken = localStorage.getItem('adminToken');

      if (adminToken) {
        // Admin session expired
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
      } else {
        // Regular user session expired
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
  verifyRegistrationOtp: (data) => api.post('/auth/verify-otp', data),
  resendRegistrationOtp: ({ email }) => api.post('/auth/resend-otp', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  updateProfile: (userData) => api.patch('/auth/update-account', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// Visa API
export const visaAPI = {
  getAll: () => api.get('/visas'),
  getById: (id) => api.get(`/visas/${id}`),
  create: (data) => api.post('/visas', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/visas/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
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