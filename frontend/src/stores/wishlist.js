import { defineStore } from 'pinia';
import { api } from '../services/api.js';
import { useAuthStore } from './auth.js';
import { useToastStore } from './toast.js';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loading: false,
  }),
  getters: {
    count: (state) => state.items.length,
    hasProduct: (state) => (productId) => state.items.some((i) => i.productId === productId),
  },
  actions: {
    async fetchWishlist() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) {
        this.items = [];
        return;
      }
      this.loading = true;
      try {
        const res = await api.get('/api/wishlist');
        this.items = res.data || [];
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        this.loading = false;
      }
    },
    async toggle(productId) {
      const auth = useAuthStore();
      const toast = useToastStore();
      if (!auth.isAuthenticated) {
        toast.info('Please log in to save items to your wishlist');
        auth.openAuthModal('login');
        return;
      }
      try {
        const res = await api.post('/api/wishlist/toggle', { productId });
        if (res.data.inWishlist) {
          toast.success('Added to your wishlist!');
        } else {
          toast.info('Removed from wishlist');
        }
        await this.fetchWishlist();
      } catch (err) {
        toast.error('Failed to update wishlist');
      }
    },
  },
});
