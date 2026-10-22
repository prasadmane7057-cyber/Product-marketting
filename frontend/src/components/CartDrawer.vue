<template>
  <div>
    <!-- Backdrop Overlay -->
    <div
      v-if="cart.isDrawerOpen"
      class="drawer-backdrop"
      @click="cart.closeDrawer"
    ></div>

    <!-- Slide-in Drawer -->
    <aside
      class="cart-drawer"
      :class="{ open: cart.isDrawerOpen }"
      aria-label="Shopping Bag"
    >
      <!-- Header -->
      <div class="drawer-header">
        <div class="header-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
          <h3>Your Shopping Bag ({{ cart.totalItems }})</h3>
        </div>
        <button class="close-drawer-btn" @click="cart.closeDrawer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Free Shipping Tracker -->
      <div class="shipping-tracker">
        <div class="tracker-text">
          <span v-if="cart.freeShippingThresholdRemaining > 0">
            Add <strong>₹{{ Math.round(cart.freeShippingThresholdRemaining) }}</strong> more for <strong>Complimentary Express Shipping</strong>!
          </span>
          <span v-else class="congrats-text">
            🎉 You have unlocked <strong>FREE Express Shipping</strong>!
          </span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${cart.freeShippingProgress}%` }"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="cart.items.length === 0" class="empty-cart">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
        </div>
        <h4>Your bag is currently empty</h4>
        <p>Explore our botanical grooming lotions and refresh your daily post-shave ritual today.</p>
        <router-link to="/shop" class="btn btn-primary" @click="cart.closeDrawer">
          Explore Products
        </router-link>
      </div>

      <!-- Cart Items List -->
      <div v-else class="cart-items-list">
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          <img :src="item.image || '/uploads/aftershave-lotion-pedestal.png'" :alt="item.productName" class="item-img" />
          <div class="item-details">
            <div class="item-top">
              <router-link :to="`/product/${item.productSlug}`" class="item-name" @click="cart.closeDrawer">
                {{ item.productName }}
              </router-link>
              <button class="btn-remove" @click="cart.removeItem(item.id)" title="Remove item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            <span v-if="item.variantName" class="item-variant">Variant: {{ item.variantName }}</span>

            <div class="item-bottom">
              <div class="qty-stepper">
                <button @click="cart.updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
                <span class="qty-val">{{ item.quantity }}</span>
                <button @click="cart.updateQuantity(item.id, item.quantity + 1)">+</button>
              </div>
              <span class="item-price">₹{{ Math.round(item.lineTotal) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer (Summary & Checkout) -->
      <div v-if="cart.items.length > 0" class="drawer-footer">
        <!-- Coupon Input -->
        <div class="coupon-box">
          <div v-if="!cart.appliedCoupon" class="coupon-input-group">
            <input
              v-model="couponCodeInput"
              type="text"
              class="input-field coupon-input"
              placeholder="Coupon code (e.g. WELCOME10)"
            />
            <button class="btn btn-secondary btn-sm" @click="handleApplyCoupon">
              Apply
            </button>
          </div>
          <div v-else class="applied-coupon-pill">
            <span class="coupon-tag">
              🏷️ <strong>{{ cart.appliedCoupon.code }}</strong> applied (-₹{{ Math.round(cart.appliedCoupon.discountAmount) }})
            </span>
            <button class="btn-remove-coupon" @click="cart.removeCoupon">✕</button>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="cost-breakdown">
          <div class="cost-row">
            <span>Subtotal</span>
            <span>₹{{ Math.round(cart.subtotal) }}</span>
          </div>
          <div v-if="cart.discountAmount > 0" class="cost-row discount-row">
            <span>Discount Applied</span>
            <span>-₹{{ Math.round(cart.discountAmount) }}</span>
          </div>
          <div class="cost-row">
            <span>Estimated Shipping</span>
            <span>{{ cart.shippingFee === 0 ? 'FREE' : `₹${Math.round(cart.shippingFee)}` }}</span>
          </div>
          <div class="cost-row total-row">
            <span>Estimated Total</span>
            <span class="grand-total">₹{{ Math.round(cart.grandTotal) }}</span>
          </div>
        </div>

        <router-link to="/checkout" class="btn btn-primary w-full checkout-btn" @click="cart.closeDrawer">
          Proceed to Secure Checkout
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '../stores/cart.js';

const cart = useCartStore();
const couponCodeInput = ref('');

const handleApplyCoupon = async () => {
  if (!couponCodeInput.value) return;
  const success = await cart.applyCoupon(couponCodeInput.value);
  if (success) {
    couponCodeInput.value = '';
  }
};
</script>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: -450px;
  width: 100%;
  max-width: 440px;
  height: 100vh;
  background: #0f172a;
  border-left: 1px solid var(--border-medium);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8);
}

.cart-drawer.open {
  right: 0;
}

.drawer-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-main);
}

.header-title h3 {
  font-size: 1.1rem;
}

.close-drawer-btn {
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.close-drawer-btn:hover {
  color: var(--text-main);
}

.shipping-tracker {
  padding: 0.85rem 1.5rem;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid var(--border-subtle);
}

.tracker-text {
  font-size: 0.8rem;
  color: #c7d2fe;
  margin-bottom: 0.5rem;
}

.congrats-text {
  color: #6ee7b7;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan) 0%, var(--primary) 100%);
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.empty-cart {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-cart h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.empty-cart p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.cart-items-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 0.85rem;
  background: var(--bg-surface-elevated);
  border-radius: 0.75rem;
  border: 1px solid var(--border-subtle);
}

.item-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 0.5rem;
  background: #090e1a;
  flex-shrink: 0;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-remove {
  color: var(--text-muted);
  transition: color 0.15s ease;
}

.btn-remove:hover {
  color: var(--accent-rose);
}

.item-variant {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
}

.qty-stepper {
  display: flex;
  align-items: center;
  background: #090e1a;
  border: 1px solid var(--border-medium);
  border-radius: 9999px;
  overflow: hidden;
}

.qty-stepper button {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  font-weight: bold;
}

.qty-stepper button:disabled {
  opacity: 0.4;
}

.qty-val {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0 0.4rem;
}

.item-price {
  font-weight: 700;
  font-size: 0.95rem;
  color: #ffffff;
}

.drawer-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  background: #090d16;
}

.coupon-box {
  margin-bottom: 1rem;
}

.coupon-input-group {
  display: flex;
  gap: 0.5rem;
}

.coupon-input {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.applied-coupon-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
  font-size: 0.82rem;
  color: #c7d2fe;
}

.btn-remove-coupon {
  color: var(--text-muted);
  font-weight: bold;
}

.btn-remove-coupon:hover {
  color: var(--accent-rose);
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.cost-row {
  display: flex;
  justify-content: space-between;
}

.discount-row {
  color: #6ee7b7;
}

.total-row {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.6rem;
  margin-top: 0.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.grand-total {
  color: #ffffff;
}

.w-full {
  width: 100%;
}

.checkout-btn {
  padding: 0.9rem;
}
</style>
