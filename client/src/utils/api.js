import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gc_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      // Skip forced logout for subscription check — it just means user is not logged in
      const isSubscriptionCheck = url.includes('/user/plan') || url.includes('/user/credits');
      if (!isSubscriptionCheck) {
        localStorage.removeItem('gc_token');
        localStorage.removeItem('gc_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
