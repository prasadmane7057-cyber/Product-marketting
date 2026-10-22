<template>
  <div class="offers-page section-padding">
    <div class="container">
      <div class="offers-header text-center">
        <span class="badge badge-discount">Active Promotional Campaigns</span>
        <h1 class="page-title">Exclusive Deals & Discount Coupons</h1>
        <p class="page-desc">Save on Aftershave Lotion – Lavender and botanical grooming essentials with active seasonal promotional codes.</p>
      </div>

      <!-- Coupons Grid -->
      <div class="coupons-grid grid-3">
        <div class="coupon-card card">
          <div class="coupon-top">
            <span class="badge badge-primary">First Order</span>
            <span class="discount-val">10% OFF</span>
          </div>
          <h3>WELCOME10</h3>
          <p>Enjoy an instant 10% discount on your entire first purchase across all grooming care and sets.</p>
          <div class="coupon-footer">
            <span class="expiry-text">Expires: Dec 31, 2027</span>
            <button class="btn btn-secondary btn-sm" @click="copyCode('WELCOME10')">
              Copy Code
            </button>
          </div>
        </div>

        <div class="coupon-card card highlight-card">
          <div class="coupon-top">
            <span class="badge badge-discount">Botanical Event</span>
            <span class="discount-val">20% OFF</span>
          </div>
          <h3>FRESH20</h3>
          <p>Get 20% off on qualifying grooming orders above $30. Perfect for duo packs.</p>
          <div class="coupon-footer">
            <span class="expiry-text">Expires: Dec 31, 2027</span>
            <button class="btn btn-primary btn-sm" @click="copyCode('FRESH20')">
              Copy Code
            </button>
          </div>
        </div>

        <div class="coupon-card card">
          <div class="coupon-top">
            <span class="badge badge-warning">Instant Savings</span>
            <span class="discount-val">₹50 OFF</span>
          </div>
          <h3>SOOTHE50</h3>
          <p>Instant ₹50 flat discount on any Aftershave Lotion order above ₹300.</p>
          <div class="coupon-footer">
            <span class="expiry-text">Expires: Dec 31, 2027</span>
            <button class="btn btn-secondary btn-sm" @click="copyCode('SOOTHE50')">
              Copy Code
            </button>
          </div>
        </div>
      </div>

      <!-- Discounted Products Showcase -->
      <section class="discounted-products section-padding">
        <div class="section-header">
          <div>
            <span class="badge badge-success">Direct Markdown</span>
            <h2 class="section-title">Deals of The Season</h2>
          </div>
          <router-link to="/shop" class="btn btn-outline btn-sm">View All in Shop &rarr;</router-link>
        </div>

        <div v-if="loading" class="grid-4">
          <div v-for="n in 4" :key="n" class="skeleton-card card"></div>
        </div>

        <div v-else class="grid-4">
          <ProductCard
            v-for="product in discountedProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../services/api.js';
import { useToastStore } from '../stores/toast.js';
import ProductCard from '../components/ProductCard.vue';

const toast = useToastStore();
const loading = ref(true);
const discountedProducts = ref([]);

const copyCode = (code) => {
  navigator.clipboard.writeText(code);
  toast.success(`Coupon code "${code}" copied to clipboard!`);
};

const fetchDeals = async () => {
  try {
    const res = await api.get('/api/products?limit=8');
    discountedProducts.value = (res.data.items || []).filter((p) => p.discountPercent > 0);
  } catch (err) {
    console.error('Failed to load deals:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDeals();
});
</script>

<style scoped>
.text-center {
  text-align: center;
}

.offers-header {
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.6rem;
  margin: 0.5rem 0;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto;
}

.coupons-grid {
  margin-bottom: 3rem;
}

.coupon-card {
  padding: 2rem;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
}

.highlight-card {
  border-color: rgba(99, 102, 241, 0.4);
  background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.12) 0%, #0f172a 100%);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.coupon-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.discount-val {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  color: #6ee7b7;
}

.coupon-card h3 {
  font-size: 1.6rem;
  font-family: monospace;
  letter-spacing: 0.05em;
  color: #a5b4fc;
  margin-bottom: 0.5rem;
}

.coupon-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.coupon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.expiry-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
