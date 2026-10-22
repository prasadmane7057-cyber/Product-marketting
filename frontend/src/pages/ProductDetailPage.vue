<template>
  <div class="product-detail-page section-padding">
    <div v-if="loading" class="container loading-container">
      <div class="skeleton-detail"></div>
    </div>

    <div v-else-if="!product" class="container text-center">
      <h2>Product Not Found</h2>
      <p>The requested hardware could not be located in our catalogue.</p>
      <router-link to="/shop" class="btn btn-primary">Return to Shop</router-link>
    </div>

    <div v-else class="container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <router-link to="/">Home</router-link>
        <span>/</span>
        <router-link to="/shop">Shop</router-link>
        <span>/</span>
        <router-link :to="`/shop?category=${product.category?.slug}`">{{ product.category?.name }}</router-link>
        <span>/</span>
        <span class="active-crumb">{{ product.name }}</span>
      </nav>

      <!-- Main Product Grid: Gallery + Purchasing Details -->
      <div class="product-layout">
        <!-- Left: Image Gallery -->
        <div class="gallery-wrapper">
          <div class="main-image-box card">
            <img :src="selectedImageUrl" :alt="product.name" class="main-img" />
            <span v-if="product.discountPercent > 0" class="badge badge-discount discount-tag">
              -{{ Math.round(product.discountPercent) }}% OFF
            </span>
          </div>
          <!-- Thumbnails -->
          <div v-if="product.images?.length > 1" class="thumbnails-row">
            <div
              v-for="img in product.images"
              :key="img.id"
              class="thumb-box"
              :class="{ active: selectedImageUrl === img.url }"
              @click="selectedImageUrl = img.url"
            >
              <img :src="img.url" :alt="img.altText || product.name" class="thumb-img" />
            </div>
          </div>
        </div>

        <!-- Right: Details & Purchase Actions -->
        <div class="product-info-col">
          <div class="brand-row">
            <span class="brand-badge">{{ product.brand }}</span>
            <span class="sku-text">SKU: {{ activeSku }}</span>
          </div>

          <h1 class="detail-title">{{ product.name }}</h1>

          <!-- Rating Summary -->
          <div class="rating-box">
            <div class="stars">★★★★★</div>
            <span class="rating-avg">{{ product.averageRating.toFixed(1) }}</span>
            <a href="#reviews" class="review-count">({{ product.reviewsCount }} verified reviews)</a>
            <span class="stock-pill" :class="{ in: inStock, out: !inStock }">
              {{ inStock ? `● In Stock (${currentStock} units)` : '○ Currently Out of Stock' }}
            </span>
          </div>

          <!-- Price Row -->
          <div class="detail-price-box">
            <span class="current-price">₹{{ Math.round(currentPrice) }}</span>
            <span v-if="product.regularPrice > currentPrice" class="regular-price">
              ₹{{ Math.round(product.regularPrice) }}
            </span>
            <span v-if="product.regularPrice > currentPrice" class="save-pill">
              Save ₹{{ Math.round(product.regularPrice - currentPrice) }}
            </span>
          </div>

          <p class="short-desc">{{ product.shortDesc }}</p>

          <!-- Variant Selector -->
          <div v-if="product.variants?.length > 0" class="variants-section">
            <label class="variant-label">Select Configuration / Variant:</label>
            <div class="variant-chips">
              <button
                v-for="v in product.variants"
                :key="v.id"
                class="variant-chip"
                :class="{ active: selectedVariant?.id === v.id }"
                @click="selectedVariant = v"
              >
                <span>{{ v.name }}</span>
                <span class="chip-price">₹{{ Math.round(v.price) }}</span>
              </button>
            </div>
          </div>

          <!-- Quantity Stepper & Cart Buttons -->
          <div class="actions-section">
            <div class="qty-box">
              <label class="variant-label">Quantity:</label>
              <div class="qty-stepper">
                <button @click="quantity > 1 ? quantity-- : null" :disabled="quantity <= 1">-</button>
                <span class="qty-val">{{ quantity }}</span>
                <button @click="quantity < currentStock ? quantity++ : null" :disabled="quantity >= currentStock">+</button>
              </div>
            </div>

            <div class="button-row">
              <button
                class="btn btn-primary btn-lg flex-1"
                @click="addToCart"
                :disabled="!inStock"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
                Add To Bag
              </button>
              <button
                class="btn btn-secondary btn-lg flex-1"
                @click="buyNow"
                :disabled="!inStock"
              >
                ⚡ Instant Buy Now
              </button>
              <button
                class="btn-wishlist-detail"
                :class="{ active: isWishlisted }"
                @click="wishlist.toggle(product.id)"
                title="Wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" :fill="isWishlisted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          </div>

          <!-- Feature Highlights Box -->
          <div class="perks-card card">
            <div class="perk-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <div>
                <strong>Express Air Shipping</strong>
                <p>Dispatched next day with real-time temperature tracking.</p>
              </div>
            </div>
            <div class="perk-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <div>
                <strong>30-Day Money-Back Guarantee</strong>
                <p>Test acoustic immersion risk-free in your own studio.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Specifications & Warranty Tabs -->
      <section class="details-tabs-section section-padding">
        <div class="tabs-header">
          <button
            :class="['tab-btn', { active: activeTab === 'desc' }]"
            @click="activeTab = 'desc'"
          >
            Detailed Description
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'specs' }]"
            @click="activeTab = 'specs'"
          >
            Technical Specifications
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'shipping' }]"
            @click="activeTab = 'shipping'"
          >
            Shipping & Warranty
          </button>
        </div>

        <div class="tab-content card">
          <!-- Description Tab -->
          <div v-if="activeTab === 'desc'" class="desc-content">
            <p>{{ product.description }}</p>
          </div>

          <!-- Specs Tab -->
          <div v-else-if="activeTab === 'specs'" class="specs-table-wrapper">
            <table class="specs-table">
              <tbody>
                <tr v-for="(val, key) in parsedSpecs" :key="key">
                  <td class="spec-key">{{ key }}</td>
                  <td class="spec-val">{{ val }}</td>
                </tr>
                <tr v-if="product.weight">
                  <td class="spec-key">Weight</td>
                  <td class="spec-val">{{ product.weight }}</td>
                </tr>
                <tr v-if="product.dimensions">
                  <td class="spec-key">Dimensions</td>
                  <td class="spec-val">{{ product.dimensions }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Shipping Tab -->
          <div v-else class="shipping-content">
            <h4>Shipping Logistics</h4>
            <p>{{ product.shippingInfo || 'Free express courier shipping across the United States. International courier transit available.' }}</p>
            <h4 style="margin-top: 1.5rem;">Warranty Policy</h4>
            <p>{{ product.returnWarrantyInfo || 'Includes 2-year comprehensive manufacturer warranty and 30-day money-back guarantee.' }}</p>
          </div>
        </div>
      </section>

      <!-- Customer Reviews Section -->
      <section id="reviews" class="reviews-section section-padding">
        <div class="section-header">
          <div>
            <span class="badge badge-primary">Community Feedback</span>
            <h2 class="section-title">Verified Customer Reviews</h2>
          </div>
          <button class="btn btn-outline btn-sm" @click="showReviewForm = !showReviewForm">
            {{ showReviewForm ? 'Cancel' : '✍️ Write a Review' }}
          </button>
        </div>

        <!-- Write Review Form -->
        <div v-if="showReviewForm" class="review-form-card card">
          <h3>Share Your Experience with {{ product.name }}</h3>
          <form @submit.prevent="submitReview" class="review-form">
            <div class="input-group">
              <label class="input-label">Star Rating</label>
              <select v-model="newReview.rating" class="input-field" style="width: 200px;">
                <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                <option value="3">★★★☆☆ (3 Stars - Average)</option>
                <option value="2">★★☆☆☆ (2 Stars - Below Expectation)</option>
                <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
              </select>
            </div>

            <div class="input-group">
              <label class="input-label">Review Headline</label>
              <input v-model="newReview.title" type="text" class="input-field" placeholder="e.g. Sublime acoustic depth and build" required />
            </div>

            <div class="input-group">
              <label class="input-label">Your Review</label>
              <textarea v-model="newReview.comment" class="input-field" rows="4" placeholder="Detail your experience with this hardware..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="submittingReview">
              {{ submittingReview ? 'Publishing...' : 'Publish Verified Review' }}
            </button>
          </form>
        </div>

        <!-- Reviews List -->
        <div v-if="product.reviews?.length === 0" class="no-reviews card">
          <p>No customer reviews yet. Be the first to share your thoughts!</p>
        </div>

        <div v-else class="reviews-list">
          <div v-for="rev in product.reviews" :key="rev.id" class="review-item card">
            <div class="rev-header">
              <div class="stars">
                <span v-for="i in rev.rating" :key="i">★</span>
              </div>
              <span v-if="rev.isVerifiedPurchase" class="verified-badge">
                ✓ Verified Purchaser
              </span>
              <span class="rev-date">{{ new Date(rev.createdAt).toLocaleDateString() }}</span>
            </div>
            <h4 class="rev-title">{{ rev.title }}</h4>
            <p class="rev-body">{{ rev.comment }}</p>
            <span class="reviewer-author">— {{ rev.userName }}</span>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section v-if="product.relatedProducts?.length > 0" class="related-section section-padding">
        <div class="section-header">
          <h2 class="section-title">Complementary Hardware</h2>
        </div>
        <div class="grid-4">
          <ProductCard
            v-for="rel in product.relatedProducts"
            :key="rel.id"
            :product="rel"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../services/api.js';
import { useCartStore } from '../stores/cart.js';
import { useWishlistStore } from '../stores/wishlist.js';
import { useToastStore } from '../stores/toast.js';
import ProductCard from '../components/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const wishlist = useWishlistStore();
const toast = useToastStore();

const loading = ref(true);
const product = ref(null);
const selectedImageUrl = ref('');
const selectedVariant = ref(null);
const quantity = ref(1);
const activeTab = ref('desc');

const showReviewForm = ref(false);
const submittingReview = ref(false);
const newReview = ref({
  rating: '5',
  title: '',
  comment: '',
});

const currentPrice = computed(() => {
  if (selectedVariant.value) return selectedVariant.value.price;
  return product.value?.sellingPrice || 0;
});

const currentStock = computed(() => {
  if (selectedVariant.value) return selectedVariant.value.stockQuantity;
  return product.value?.stockQuantity || 0;
});

const inStock = computed(() => currentStock.value > 0);

const activeSku = computed(() => {
  if (selectedVariant.value) return selectedVariant.value.sku;
  return product.value?.sku || '';
});

const isWishlisted = computed(() => product.value && wishlist.hasProduct(product.value.id));

const parsedSpecs = computed(() => {
  if (!product.value?.specifications) return {};
  try {
    return JSON.parse(product.value.specifications);
  } catch {
    return {};
  }
});

const fetchProduct = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/api/products/${route.params.slug}`);
    product.value = res.data;
    selectedImageUrl.value = product.value.primaryImage || product.value.images[0]?.url || '';
    if (product.value.variants?.length > 0) {
      selectedVariant.value = product.value.variants[0];
    }
  } catch (err) {
    console.error('Failed to load product:', err);
  } finally {
    loading.value = false;
  }
};

const addToCart = () => {
  if (!product.value) return;
  cart.addToCart(product.value.id, selectedVariant.value?.id || null, quantity.value);
};

const buyNow = async () => {
  if (!product.value) return;
  await cart.addToCart(product.value.id, selectedVariant.value?.id || null, quantity.value);
  router.push('/checkout');
};

const submitReview = async () => {
  submittingReview.value = true;
  try {
    const res = await api.post('/api/reviews', {
      productId: product.value.id,
      rating: parseInt(newReview.value.rating, 10),
      title: newReview.value.title,
      comment: newReview.value.comment,
    });
    toast.success(res.message || 'Review submitted!');
    showReviewForm.value = false;
    newReview.value = { rating: '5', title: '', comment: '' };
    fetchProduct();
  } catch (err) {
    toast.error(err.message || 'Could not submit review');
  } finally {
    submittingReview.value = false;
  }
};

watch(() => route.params.slug, () => {
  fetchProduct();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.breadcrumbs a:hover {
  color: var(--primary);
}

.active-crumb {
  color: var(--text-main);
  font-weight: 600;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: flex-start;
}

.gallery-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image-box {
  position: relative;
  width: 100%;
  height: 500px;
  background: radial-gradient(circle at center, rgba(30, 27, 75, 0.45) 0%, rgba(9, 14, 26, 0.98) 100%);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.6);
  border: 1px solid var(--border-medium);
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
  transition: transform 0.35s ease;
}

.main-image-box:hover .main-img {
  transform: scale(1.02);
}

.discount-tag {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.thumbnails-row {
  display: flex;
  gap: 0.85rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
}

.thumb-box {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 0.75rem;
  border: 2px solid var(--border-subtle);
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.thumb-box.active,
.thumb-box:hover {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.product-info-col {
  display: flex;
  flex-direction: column;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.brand-badge {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #a5b4fc;
}

.sku-text {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.detail-title {
  font-size: 2.3rem;
  margin-bottom: 0.85rem;
  line-height: 1.15;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.stars {
  color: #fbbf24;
}

.rating-avg {
  font-weight: 700;
}

.review-count {
  color: var(--text-secondary);
  text-decoration: underline;
}

.stock-pill {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 700;
}

.stock-pill.in {
  color: #6ee7b7;
}

.stock-pill.out {
  color: #fda4af;
}

.detail-price-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.current-price {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
}

.regular-price {
  font-size: 1.2rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.save-pill {
  padding: 0.25rem 0.65rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 9999px;
}

.short-desc {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.75rem;
}

.variants-section {
  margin-bottom: 1.5rem;
}

.variant-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.6rem;
}

.variant-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.variant-chip {
  padding: 0.65rem 1rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 0.6rem;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.variant-chip:hover {
  border-color: var(--primary);
}

.variant-chip.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 0 12px var(--primary-glow);
}

.chip-price {
  color: #a5b4fc;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.qty-stepper {
  display: inline-flex;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 9999px;
  overflow: hidden;
}

.qty-stepper button {
  width: 34px;
  height: 34px;
  font-size: 1.1rem;
  color: var(--text-main);
}

.qty-val {
  display: flex;
  align-items: center;
  padding: 0 0.85rem;
  font-weight: 700;
}

.button-row {
  display: flex;
  gap: 0.75rem;
}

.flex-1 {
  flex: 1;
}

.btn-wishlist-detail {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-wishlist-detail:hover {
  color: var(--accent-rose);
  border-color: var(--accent-rose);
}

.btn-wishlist-detail.active {
  color: var(--accent-rose);
  background: rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.4);
}

.perks-card {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.perk-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.perk-item strong {
  display: block;
  color: var(--text-main);
}

.perk-item p {
  color: var(--text-muted);
}

/* Tabs */
.tabs-header {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.5rem;
}

.tabs-header .tab-btn {
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}

.tabs-header .tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  padding: 2rem;
  background: var(--bg-surface);
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.92rem;
}

.spec-key {
  color: var(--text-muted);
  width: 35%;
  font-weight: 600;
}

.spec-val {
  color: var(--text-main);
}

/* Reviews */
.review-form-card {
  padding: 2rem;
  margin-bottom: 2rem;
  background: var(--bg-surface-elevated);
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.review-item {
  padding: 1.5rem;
  background: var(--bg-surface);
}

.rev-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}

.verified-badge {
  font-size: 0.75rem;
  color: #6ee7b7;
  font-weight: 700;
}

.rev-date {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.rev-title {
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

.rev-body {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.reviewer-author {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
}

@media (max-width: 992px) {
  .product-layout {
    grid-template-columns: 1fr;
  }
}
</style>
