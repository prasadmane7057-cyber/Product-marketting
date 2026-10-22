import { defineStore } from 'pinia';
import { api } from '../services/api.js';
import { useToastStore } from './toast.js';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    subtotal: 0,
    totalItems: 0,
    loading: false,
    isDrawerOpen: false,
    appliedCoupon: JSON.parse(localStorage.getItem('novamarket_coupon') || 'null'),
  }),
  getters: {
    discountAmount: (state) => state.appliedCoupon?.discountAmount || 0,
    shippingFee: (state) => (state.subtotal >= 499 || state.subtotal === 0 ? 0 : 49),
    freeShippingThresholdRemaining: (state) => Math.max(0, 499 - state.subtotal),
    freeShippingProgress: (state) => Math.min(100, Math.round((state.subtotal / 499) * 100)),
    estimatedTax: (state) => {
      const taxable = Math.max(0, state.subtotal - (state.appliedCoupon?.discountAmount || 0));
      return Number((taxable * 0.05).toFixed(2));
    },
    grandTotal: (state) => {
      const discount = state.appliedCoupon?.discountAmount || 0;
      const taxable = Math.max(0, state.subtotal - discount);
      const tax = Number((taxable * 0.05).toFixed(2));
      const shipping = state.subtotal >= 499 || state.subtotal === 0 ? 0 : 49;
      return Number((taxable + tax + shipping).toFixed(2));
    },
  },
  actions: {
    openDrawer() {
      this.isDrawerOpen = true;
    },
    closeDrawer() {
      this.isDrawerOpen = false;
    },
    async fetchCart() {
      this.loading = true;
      try {
        const res = await api.get('/api/cart');
        if (res.data) {
          this.items = res.data.items || [];
          this.subtotal = res.data.subtotal || 0;
          this.totalItems = res.data.totalItems || 0;
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        this.loading = false;
      }
    },
    async addToCart(productId, variantId = null, quantity = 1) {
      const toast = useToastStore();
      try {
        const res = await api.post('/api/cart/add', { productId, variantId, quantity });
        this.items = res.data.items || [];
        this.subtotal = res.data.subtotal || 0;
        this.totalItems = res.data.totalItems || 0;
        toast.success('Item added to your shopping bag!');
        this.openDrawer();
        return true;
      } catch (err) {
        toast.error(err.message || 'Could not add item to cart');
        return false;
      }
    },
    async updateQuantity(itemId, quantity) {
      const toast = useToastStore();
      try {
        const res = await api.put(`/api/cart/items/${itemId}`, { quantity });
        this.items = res.data.items || [];
        this.subtotal = res.data.subtotal || 0;
        this.totalItems = res.data.totalItems || 0;
      } catch (err) {
        toast.error(err.message || 'Could not update item quantity');
      }
    },
    async removeItem(itemId) {
      const toast = useToastStore();
      try {
        const res = await api.delete(`/api/cart/items/${itemId}`);
        this.items = res.data.items || [];
        this.subtotal = res.data.subtotal || 0;
        this.totalItems = res.data.totalItems || 0;
        toast.info('Item removed from bag');
      } catch (err) {
        toast.error(err.message || 'Could not remove item');
      }
    },
    async applyCoupon(code) {
      const toast = useToastStore();
      try {
        const res = await api.post('/api/coupons/validate', {
          code,
          subtotal: this.subtotal,
        });
        this.appliedCoupon = res.data;
        localStorage.setItem('novamarket_coupon', JSON.stringify(res.data));
        toast.success(`Coupon "${res.data.code}" applied! You saved ₹${res.data.discountAmount}`);
        return true;
      } catch (err) {
        toast.error(err.message || 'Invalid coupon code');
        return false;
      }
    },
    removeCoupon() {
      this.appliedCoupon = null;
      localStorage.removeItem('novamarket_coupon');
      const toast = useToastStore();
      toast.info('Coupon removed');
    },
    clearCart() {
      this.items = [];
      this.subtotal = 0;
      this.totalItems = 0;
      this.appliedCoupon = null;
      localStorage.removeItem('novamarket_coupon');
    },
  },
});
