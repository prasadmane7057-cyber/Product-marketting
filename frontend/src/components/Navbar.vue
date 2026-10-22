<template>
  <header class="navbar-wrapper glass-panel">
    <!-- Top Announcement Bar -->
    <div class="top-bar">
      <div class="container top-bar-content">
        <div class="announcement">
          <span class="sparkle">✨</span>
          <span>Complimentary Express Shipping on Orders Over ₹499 | Use code <strong>WELCOME10</strong> for 10% Off</span>
        </div>
        <div class="top-links">
          <router-link to="/track">Track Order</router-link>
          <span class="divider">|</span>
          <router-link to="/contact">Help & WhatsApp</router-link>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <nav class="container nav-main">
      <!-- Brand Logo -->
      <router-link to="/" class="brand-logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-title">Nova<span class="accent-dot">Market</span></span>
          <span class="logo-subtitle">Botanical Grooming</span>
        </div>
      </router-link>

      <!-- Desktop Nav Links -->
      <ul class="nav-links">
        <li><router-link to="/" exact-active-class="active-link">Home</router-link></li>
        <li><router-link to="/shop" active-class="active-link">Shop</router-link></li>
        <li><router-link to="/shop?category=mens-grooming" active-class="active-link">Grooming Care</router-link></li>
        <li>
          <router-link to="/offers" class="offer-pill" active-class="active-link">
            Offers
            <span class="hot-badge">SALE</span>
          </router-link>
        </li>
        <li><router-link to="/about" active-class="active-link">About Us</router-link></li>
        <li><router-link to="/contact" active-class="active-link">Contact</router-link></li>
      </ul>

      <!-- Right Action Icons -->
      <div class="nav-actions">
        <!-- Admin Dashboard Quick Link -->
        <router-link v-if="auth.isAdmin" to="/admin" class="btn btn-sm btn-primary admin-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Admin Portal
        </router-link>

        <!-- Wishlist Icon -->
        <router-link to="/wishlist" class="action-btn" title="Wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span v-if="wishlist.count > 0" class="counter-badge">{{ wishlist.count }}</span>
        </router-link>

        <!-- Shopping Cart Button -->
        <button class="action-btn" @click="cart.openDrawer" title="Shopping Cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <span v-if="cart.totalItems > 0" class="counter-badge">{{ cart.totalItems }}</span>
        </button>

        <!-- User Profile / Login -->
        <div v-if="auth.isAuthenticated" class="user-dropdown-container">
          <router-link to="/account" class="user-profile-btn" title="My Account">
            <div class="user-avatar">{{ auth.user.firstName[0] }}</div>
            <span class="user-name">{{ auth.user.firstName }}</span>
          </router-link>
          <button class="logout-icon-btn" @click="auth.logout" title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>

        <button v-else class="btn btn-sm btn-secondary" @click="auth.openAuthModal('login')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Sign In
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    <div v-if="mobileMenuOpen" class="mobile-menu">
      <router-link to="/" @click="mobileMenuOpen = false">Home</router-link>
      <router-link to="/shop" @click="mobileMenuOpen = false">Shop All Products</router-link>
      <router-link to="/shop?category=audio-acoustics" @click="mobileMenuOpen = false">Categories</router-link>
      <router-link to="/offers" @click="mobileMenuOpen = false">Special Offers & Deals</router-link>
      <router-link to="/about" @click="mobileMenuOpen = false">About Us</router-link>
      <router-link to="/contact" @click="mobileMenuOpen = false">Contact & Support</router-link>
      <router-link to="/track" @click="mobileMenuOpen = false">Track Order</router-link>
      <router-link v-if="auth.isAdmin" to="/admin" @click="mobileMenuOpen = false" class="admin-mobile-link">
        Admin Portal
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useCartStore } from '../stores/cart.js';
import { useWishlistStore } from '../stores/wishlist.js';

const auth = useAuthStore();
const cart = useCartStore();
const wishlist = useWishlistStore();

const mobileMenuOpen = ref(false);
</script>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 500;
  border-bottom: 1px solid var(--border-subtle);
}

.top-bar {
  background: rgba(99, 102, 241, 0.12);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  font-size: 0.78rem;
  padding: 0.35rem 0;
  color: #c7d2fe;
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.divider {
  opacity: 0.4;
}

.nav-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, hsl(245, 82%, 46%) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.accent-dot {
  color: var(--primary);
}

.logo-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.8rem;
  list-style: none;
}

.nav-links a {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

.nav-links a:hover,
.active-link {
  color: #ffffff !important;
}

.offer-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.hot-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  background: var(--accent-rose);
  color: white;
  border-radius: 4px;
  font-weight: 700;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.action-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  color: var(--text-main);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.counter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.user-dropdown-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem 0.35rem 0.35rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 9999px;
  transition: border-color 0.2s ease;
}

.user-profile-btn:hover {
  border-color: var(--primary);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.logout-icon-btn {
  color: var(--text-muted);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.logout-icon-btn:hover {
  color: var(--accent-rose);
  background: rgba(244, 63, 94, 0.1);
}

.mobile-toggle {
  display: none;
  color: var(--text-main);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.mobile-menu a {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.admin-mobile-link {
  color: var(--primary) !important;
}

@media (max-width: 992px) {
  .nav-links, .top-links {
    display: none;
  }
  .mobile-toggle {
    display: block;
  }
}
</style>
