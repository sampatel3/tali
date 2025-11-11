import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/onboarding';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  getUAEPassUrl: () => api.post('/auth/uae-pass/login'),
  uaePassCallback: (code, state) => api.post('/auth/uae-pass/callback', { code, state }),
  logout: () => api.post('/auth/logout'),
};

export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  createLinkToken: () => api.post('/accounts/link/token'),
  exchangeToken: (publicToken) => api.post('/accounts/link/exchange', { public_token: publicToken }),
  sync: (accountId) => api.post(`/accounts/${accountId}/sync`),
  delete: (accountId) => api.delete(`/accounts/${accountId}`),
};

export const subscriptionsAPI = {
  getAll: (status) => api.get('/subscriptions', { params: { status } }),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  detect: () => api.post('/subscriptions/detect'),
};

export const loyaltyAPI = {
  getPrograms: () => api.get('/loyalty/programs'),
  getCards: () => api.get('/loyalty/cards'),
  getCard: (id) => api.get(`/loyalty/cards/${id}`),
  addCard: (data) => api.post('/loyalty/cards', data),
  updateCard: (id, data) => api.put(`/loyalty/cards/${id}`, data),
  deleteCard: (id) => api.delete(`/loyalty/cards/${id}`),
  getTransactions: (cardId) => api.get('/loyalty/transactions', { params: { cardId } }),
  sync: (cardId) => api.post(`/loyalty/cards/${cardId}/sync`),
  getSuggestions: () => api.get('/loyalty/suggestions'),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getSpendingByCategory: (startDate, endDate) =>
    api.get('/analytics/spending-by-category', { params: { startDate, endDate } }),
};

export const notificationsAPI = {
  getAll: (unreadOnly) => api.get('/notifications', { params: { unreadOnly } }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (data) => api.put('/users/settings', data),
};

export const uploadAPI = {
  uploadStatement: (file) => {
    const formData = new FormData();
    formData.append('statement', file);
    return api.post('/upload/statement', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStatements: () => api.get('/upload/statements'),
  getStatementStatus: (id) => api.get(`/upload/statements/${id}`),
};
