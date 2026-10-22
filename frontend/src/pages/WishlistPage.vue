<template>
  <div class="wishlist-page section-padding">
    <div class="container">
      <div class="wishlist-header">
        <h1 class="page-title">Saved Wishlist ({{ wishlist.count }})</h1>
        <p class="page-desc">Your curated list of desired audio acoustics and computing hardware.</p>
      </div>

      <div v-if="wishlist.loading" class="loading-state card p-5 text-center">
        <p>Loading your saved wishlist items...</p>
      </div>

      <div v-else-if="wishlist.items.length === 0" class="empty-wishlist card text-center">
        <div class="empty-icon">♡</div>
        <h3>Your wishlist is currently empty</h3>
        <p>Click the heart icon on any product in our catalogue to save it here for later.</p>
        <router-link to="/shop" class="btn btn-primary" style="margin-top: 1rem;">
          Explore Catalogue
        </router-link>
      </div>

      <div v-else class="wishlist-grid grid-4">
        <div v-for="item in wishlist.items" :key="item.id" class="wishlist-item card">
          <div class="item-img-box">
            <img :src="item.image" :alt="item.name" class="item-img" />
            <button class="btn-remove-wish" @click="wishlist.toggle(item.productId)" title="Remove from wishlist">
              ✕
            </button>
          </div>
          <div class="item-content">
            <span class="item-brand">{{ item.brand }}</span>
            <router-link :to="`/product/${item.slug}`" class="item-title">
              {{ item.name }}
            </router-link>
            <div class="price-row">
              <span class="selling-price">₹{{ Math.round(item.sellingPrice) }}</span>
              <span v-if="item.regularPrice > item.sellingPrice" class="reg-price">
                ₹{{ Math.round(item.regularPrice) }}
              </span>
            </div>
            <button class="btn btn-primary btn-sm w-full" @click="moveToCart(item.productId)">
              Move to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWishlistStore } from '../stores/wishlist.js';
import { useCartStore } from '../stores/cart.js';

const wishlist = useWishlistStore();
const cart = useCartStore();

const moveToCart = (productId) => {
  cart.addToCart(productId, null, 1);
  wishlist.toggle(productId);
};

onMounted(() => {
  wishlist.fetchWishlist();
});
</script>

<style scoped>
.wishlist-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.4rem;
  margin-bottom: 0.35rem;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
}

.empty-wishlist {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.item-img-box {
  position: relative;
  width: 100%;
  height: 200px;
  background: #090e1a;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-wish {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.item-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-brand {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
}

.item-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.selling-price {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}

.reg-price {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.w-full {
  width: 100%;
}
</style>
