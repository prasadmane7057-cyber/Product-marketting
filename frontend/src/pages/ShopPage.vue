<template>
  <div class="shop-page section-padding">
    <div class="container">
      <!-- Breadcrumbs & Header -->
      <div class="shop-header">
        <div class="breadcrumbs">
          <router-link to="/">Home</router-link>
          <span>/</span>
          <span>Catalogue</span>
        </div>
        <h1 class="page-title">Explore Store Catalogue</h1>
        <p class="page-desc">Browse our curated selection of botanical aftershave lotions and skin-friendly daily grooming essentials.</p>
      </div>

      <!-- Shop Layout: Sidebar Filters + Main Grid -->
      <div class="shop-layout">
        <!-- Sidebar Filters -->
        <aside class="filters-sidebar card">
          <div class="filter-header">
            <h3>Filters</h3>
            <button class="btn-clear" @click="resetFilters">Reset All</button>
          </div>

          <!-- Search Input -->
          <div class="filter-group">
            <label class="filter-label">Search</label>
            <div class="search-input-box">
              <input
                v-model="filters.q"
                type="text"
                class="input-field"
                placeholder="Search products, brands..."
                @input="debouncedFetch"
              />
            </div>
          </div>

          <!-- Categories -->
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <div class="filter-options">
              <label class="radio-option">
                <input
                  type="radio"
                  name="cat"
                  value=""
                  v-model="filters.category"
                  @change="fetchProducts"
                />
                <span>All Categories</span>
              </label>
              <label
                v-for="cat in categories"
                :key="cat.id"
                class="radio-option"
              >
                <input
                  type="radio"
                  name="cat"
                  :value="cat.slug"
                  v-model="filters.category"
                  @change="fetchProducts"
                />
                <span>{{ cat.name }}</span>
              </label>
            </div>
          </div>

          <!-- Price Range -->
          <div class="filter-group">
            <label class="filter-label">Price Range (₹)</label>
            <div class="price-inputs">
              <input
                v-model="filters.minPrice"
                type="number"
                class="input-field"
                placeholder="Min"
                @change="fetchProducts"
              />
              <span class="to-dash">-</span>
              <input
                v-model="filters.maxPrice"
                type="number"
                class="input-field"
                placeholder="Max"
                @change="fetchProducts"
              />
            </div>
          </div>

          <!-- Special Status -->
          <div class="filter-group">
            <label class="filter-label">Highlights</label>
            <div class="checkbox-options">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  v-model="filters.isFeatured"
                  @change="fetchProducts"
                />
                <span>Featured Products</span>
              </label>
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  v-model="filters.isBestSeller"
                  @change="fetchProducts"
                />
                <span>Best Sellers</span>
              </label>
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  v-model="filters.isTrending"
                  @change="fetchProducts"
                />
                <span>Trending Now</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Main Product Results Area -->
        <main class="shop-main">
          <!-- Top Sort & Count Bar -->
          <div class="shop-toolbar card">
            <div class="results-count">
              Showing <strong>{{ pagination.total }}</strong> products
            </div>
            <div class="sort-selector">
              <label for="sortSelect">Sort By:</label>
              <select
                id="sortSelect"
                v-model="filters.sort"
                class="input-field sort-dropdown"
                @change="fetchProducts"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-grid grid-3">
            <div v-for="n in 6" :key="n" class="skeleton-card card"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="products.length === 0" class="empty-state card">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3>No products match your criteria</h3>
            <p>Try clearing some filters or searching with different keywords.</p>
            <button class="btn btn-primary" @click="resetFilters">
              Clear All Filters
            </button>
          </div>

          <!-- Products Grid -->
          <div v-else class="grid-3">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="pagination-wrapper">
            <button
              class="btn btn-secondary btn-sm"
              :disabled="pagination.page <= 1"
              @click="changePage(pagination.page - 1)"
            >
              &larr; Previous
            </button>
            <span class="page-indicator">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button
              class="btn btn-secondary btn-sm"
              :disabled="pagination.page >= pagination.totalPages"
              @click="changePage(pagination.page + 1)"
            >
              Next &rarr;
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../services/api.js';
import ProductCard from '../components/ProductCard.vue';

const route = useRoute();

const loading = ref(true);
const products = ref([]);
const categories = ref([]);
const pagination = reactive({
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 1,
});

const filters = reactive({
  q: '',
  category: route.query.category || '',
  minPrice: '',
  maxPrice: '',
  isFeatured: false,
  isBestSeller: false,
  isTrending: false,
  sort: 'newest',
});

let debounceTimer = null;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pagination.page = 1;
    fetchProducts();
  }, 350);
};

const fetchCategories = async () => {
  try {
    const res = await api.get('/api/categories');
    categories.value = res.data;
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const queryParams = new URLSearchParams();
    if (filters.q) queryParams.set('q', filters.q);
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
    if (filters.isFeatured) queryParams.set('isFeatured', 'true');
    if (filters.isBestSeller) queryParams.set('isBestSeller', 'true');
    if (filters.isTrending) queryParams.set('isTrending', 'true');
    if (filters.sort) queryParams.set('sort', filters.sort);
    queryParams.set('page', pagination.page);
    queryParams.set('limit', pagination.limit);

    const res = await api.get(`/api/products?${queryParams.toString()}`);
    products.value = res.data.items;
    pagination.total = res.data.pagination.total;
    pagination.totalPages = res.data.pagination.totalPages;
  } catch (err) {
    console.error('Failed to load products:', err);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.q = '';
  filters.category = '';
  filters.minPrice = '';
  filters.maxPrice = '';
  filters.isFeatured = false;
  filters.isBestSeller = false;
  filters.isTrending = false;
  filters.sort = 'newest';
  pagination.page = 1;
  fetchProducts();
};

const changePage = (newPage) => {
  pagination.page = newPage;
  fetchProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(
  () => route.query.category,
  (newCat) => {
    if (newCat !== undefined) {
      filters.category = newCat;
      fetchProducts();
    }
  }
);

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.shop-header {
  margin-bottom: 2.5rem;
}

.breadcrumbs {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.breadcrumbs a:hover {
  color: var(--primary);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.4rem;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
}

.shop-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: flex-start;
}

.filters-sidebar {
  padding: 1.5rem;
  background: var(--bg-surface);
  position: sticky;
  top: 5.5rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.btn-clear {
  font-size: 0.8rem;
  color: var(--primary);
  font-weight: 600;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.65rem;
}

.filter-options,
.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

.radio-option:hover,
.checkbox-option:hover {
  color: var(--text-main);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.to-dash {
  color: var(--text-muted);
}

.shop-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  background: var(--bg-surface);
}

.results-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.sort-selector {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.sort-dropdown {
  width: auto;
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  color: var(--text-muted);
}

.pagination-wrapper {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
}

.page-indicator {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

@media (max-width: 992px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }
  .filters-sidebar {
    position: static;
  }
}
</style>
