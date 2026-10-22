import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

import HomePage from '../pages/HomePage.vue';
import ShopPage from '../pages/ShopPage.vue';
import ProductDetailPage from '../pages/ProductDetailPage.vue';
import CheckoutPage from '../pages/CheckoutPage.vue';
import OrderSuccessPage from '../pages/OrderSuccessPage.vue';
import TrackOrderPage from '../pages/TrackOrderPage.vue';
import OffersPage from '../pages/OffersPage.vue';
import AboutPage from '../pages/AboutPage.vue';
import ContactPage from '../pages/ContactPage.vue';
import AccountPage from '../pages/AccountPage.vue';
import WishlistPage from '../pages/WishlistPage.vue';

// Admin Pages
import AdminDashboardPage from '../pages/AdminDashboardPage.vue';
import AdminProductsPage from '../pages/AdminProductsPage.vue';
import AdminOrdersPage from '../pages/AdminOrdersPage.vue';
import AdminCouponsPage from '../pages/AdminCouponsPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/shop', name: 'Shop', component: ShopPage },
  { path: '/product/:slug', name: 'ProductDetail', component: ProductDetailPage },
  { path: '/checkout', name: 'Checkout', component: CheckoutPage },
  { path: '/order-success/:orderNumber', name: 'OrderSuccess', component: OrderSuccessPage },
  { path: '/track', name: 'TrackOrder', component: TrackOrderPage },
  { path: '/offers', name: 'Offers', component: OffersPage },
  { path: '/about', name: 'About', component: AboutPage },
  { path: '/contact', name: 'Contact', component: ContactPage },
  {
    path: '/account',
    name: 'Account',
    component: AccountPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: WishlistPage,
    meta: { requiresAuth: true },
  },

  // Admin Routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboardPage,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProductsPage,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrdersPage,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/coupons',
    name: 'AdminCoupons',
    component: AdminCouponsPage,
    meta: { requiresAdmin: true },
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  },
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated || !auth.isAdmin) {
      auth.openAuthModal('login');
      return next({ name: 'Home' });
    }
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      auth.openAuthModal('login');
      return next({ name: 'Home' });
    }
  }

  next();
});

export default router;
