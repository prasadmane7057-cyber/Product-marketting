<template>
  <div id="app" class="app-root">
    <!-- Main Global Navbar -->
    <Navbar />

    <!-- Main View Transition -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Cart Drawer -->
    <CartDrawer />

    <!-- Global Auth Modal (Login / Register) -->
    <AuthModal />

    <!-- Global Floating WhatsApp Concierge -->
    <WhatsAppButton />

    <!-- Global Toast Container -->
    <ToastContainer />

    <!-- Global Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import CartDrawer from './components/CartDrawer.vue';
import AuthModal from './components/AuthModal.vue';
import ToastContainer from './components/ToastContainer.vue';
import WhatsAppButton from './components/WhatsAppButton.vue';
import { useAuthStore } from './stores/auth.js';
import { useCartStore } from './stores/cart.js';
import { useWishlistStore } from './stores/wishlist.js';

const auth = useAuthStore();
const cart = useCartStore();
const wishlist = useWishlistStore();

onMounted(async () => {
  await auth.fetchMe();
  await cart.fetchCart();
  if (auth.isAuthenticated) {
    await wishlist.fetchWishlist();
  }
});
</script>

<style>
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
}

/* Page Transitions */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
