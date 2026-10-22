<template>
  <div class="product-card card">
    <!-- Image Box & Badges -->
    <div class="image-wrapper">
      <router-link :to="`/product/${product.slug}`" class="image-link">
        <img
          :src="primaryImageUrl"
          :alt="product.name"
          class="product-img"
          loading="lazy"
        />
      </router-link>

      <!-- Badges -->
      <div class="badges-row">
        <span v-if="product.discountPercent > 0" class="badge badge-discount">
          -{{ Math.round(product.discountPercent) }}%
        </span>
        <span v-if="product.isBestSeller" class="badge badge-warning">
          HOT
        </span>
        <span v-else-if="product.isTrending" class="badge badge-primary">
          TRENDING
        </span>
      </div>

      <!-- Wishlist Action Button -->
      <button
        class="wishlist-btn"
        :class="{ active: isWishlisted }"
        @click.stop="toggleWishlist"
        :title="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isWishlisted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>

    <!-- Info Box -->
    <div class="product-info">
      <div class="brand-row">
        <span class="product-brand">{{ product.brand }}</span>
        <span class="product-category" v-if="product.category?.name">{{ product.category.name }}</span>
      </div>

      <router-link :to="`/product/${product.slug}`" class="product-title-link">
        <h3 class="product-title">{{ product.name }}</h3>
      </router-link>

      <!-- Rating Row -->
      <div class="rating-row">
        <div class="stars">
          <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(product.averageRating || 5) }">★</span>
        </div>
        <span class="rating-val">{{ (product.averageRating || 5).toFixed(1) }}</span>
        <span class="reviews-count">({{ product.reviewsCount || 3 }})</span>
      </div>

      <!-- Pricing & Add to Cart -->
      <div class="price-action-row">
        <div class="price-box">
          <span class="current-price">₹{{ Math.round(product.sellingPrice) }}</span>
          <span v-if="product.regularPrice > product.sellingPrice" class="regular-price">
            ₹{{ Math.round(product.regularPrice) }}
          </span>
        </div>

        <button
          class="btn-add-cart"
          @click.stop="handleAddToCart"
          :disabled="isOutOfStock"
          :title="isOutOfStock ? 'Out of stock' : 'Quick add to cart'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <span class="add-text">Add</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCartStore } from '../stores/cart.js';
import { useWishlistStore } from '../stores/wishlist.js';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cart = useCartStore();
const wishlist = useWishlistStore();

const primaryImageUrl = computed(() => {
  if (props.product.primaryImage) return props.product.primaryImage;
  if (props.product.images && props.product.images.length > 0) {
    const primary = props.product.images.find((i) => i.isPrimary);
    return primary ? primary.url : props.product.images[0].url;
  }
  return '/uploads/aftershave-lotion-pedestal.png';
});

const isWishlisted = computed(() => wishlist.hasProduct(props.product.id));

const isOutOfStock = computed(() => (props.product.stockQuantity || 0) <= 0);

const toggleWishlist = () => {
  wishlist.toggle(props.product.id);
};

const handleAddToCart = () => {
  // If product has variants, pick first variant or standard product id
  const variantId = props.product.variants && props.product.variants.length > 0 ? props.product.variants[0].id : null;
  cart.addToCart(props.product.id, variantId, 1);
};
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 260px;
  background: radial-gradient(circle at center, rgba(30, 27, 75, 0.4) 0%, #090e1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.75rem;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .product-img {
  transform: scale(1.06);
}

.badges-row {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  z-index: 2;
}

.wishlist-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.2s ease;
}

.wishlist-btn:hover {
  background: var(--bg-surface);
  color: var(--accent-rose);
  transform: scale(1.1);
}

.wishlist-btn.active {
  color: var(--accent-rose);
  background: rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.4);
}

.product-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.brand-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
  font-weight: 600;
}

.product-title-link {
  margin-bottom: 0.5rem;
}

.product-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
  transition: color 0.15s ease;
}

.product-title-link:hover .product-title {
  color: var(--primary);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
  font-size: 0.82rem;
}

.stars {
  color: #fbbf24;
  letter-spacing: 1px;
}

.rating-val {
  font-weight: 700;
  color: var(--text-main);
}

.reviews-count {
  color: var(--text-muted);
}

.price-action-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.price-box {
  display: flex;
  flex-direction: column;
}

.current-price {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
}

.regular-price {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.btn-add-cart {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 9999px;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-add-cart:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 4px 12px var(--primary-glow);
  transform: translateY(-1px);
}

.btn-add-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
