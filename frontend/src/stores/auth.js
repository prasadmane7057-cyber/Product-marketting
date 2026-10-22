import { defineStore } from 'pinia';
import { api } from '../services/api.js';
import { useToastStore } from './toast.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('novamarket_user') || 'null'),
    token: localStorage.getItem('novamarket_token') || null,
    loading: false,
    authModalOpen: false,
    authModalMode: 'login', // 'login' or 'register'
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    userName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },
  actions: {
    openAuthModal(mode = 'login') {
      this.authModalMode = mode;
      this.authModalOpen = true;
    },
    closeAuthModal() {
      this.authModalOpen = false;
    },
    async login(email, password) {
      this.loading = true;
      const toast = useToastStore();
      try {
        const res = await api.post('/api/auth/login', { email, password });
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('novamarket_token', this.token);
        localStorage.setItem('novamarket_user', JSON.stringify(this.user));
        toast.success(`Welcome back, ${this.user.firstName}!`);
        this.closeAuthModal();
        return true;
      } catch (err) {
        toast.error(err.message || 'Login failed');
        return false;
      } finally {
        this.loading = false;
      }
    },
    async register(formData) {
      this.loading = true;
      const toast = useToastStore();
      try {
        const res = await api.post('/api/auth/register', formData);
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('novamarket_token', this.token);
        localStorage.setItem('novamarket_user', JSON.stringify(this.user));
        toast.success('Registration successful! Welcome to NovaMarket.');
        this.closeAuthModal();
        return true;
      } catch (err) {
        toast.error(err.message || 'Registration failed');
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      if (!this.token) return;
      try {
        const res = await api.get('/api/auth/me');
        this.user = res.data;
        localStorage.setItem('novamarket_user', JSON.stringify(this.user));
      } catch {
        this.logout();
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('novamarket_token');
      localStorage.removeItem('novamarket_user');
      const toast = useToastStore();
      toast.info('You have been logged out.');
    },
  },
});
