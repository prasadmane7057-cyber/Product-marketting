<template>
  <div class="admin-products section-padding">
    <div class="container">
      <!-- Admin Top Nav Header -->
      <div class="admin-header">
        <div>
          <span class="badge badge-primary">Inventory & Catalogue Control</span>
          <h1 class="page-title">Product Catalogue Management</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" @click="exportCSV">
            📥 Export CSV
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            + Add New Product
          </button>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="toolbar card">
        <input
          v-model="searchQuery"
          type="text"
          class="input-field search-box"
          placeholder="Search by name, SKU, or brand..."
          @input="fetchProducts"
        />
        <select v-model="selectedCategory" class="input-field filter-select" @change="fetchProducts">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Products Table -->
      <div class="table-card card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name & SKU</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id">
                <td>
                  <img :src="p.images[0]?.url || '/uploads/aftershave-lotion-bottle.png'" :alt="p.name" class="table-thumb" />
                </td>
                <td>
                  <strong>{{ p.name }}</strong>
                  <span class="sku-sub font-mono">SKU: {{ p.sku }}</span>
                </td>
                <td>{{ p.brand }}</td>
                <td>{{ p.category?.name }}</td>
                <td><strong>₹{{ Math.round(p.sellingPrice) }}</strong></td>
                <td>
                  <span :class="p.stockQuantity <= 15 ? 'stock-low' : 'stock-ok'">
                    {{ p.stockQuantity }} units
                  </span>
                </td>
                <td>
                  <span class="badge" :class="p.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'">
                    {{ p.status }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-secondary" @click="openEditModal(p)">Edit</button>
                    <button class="btn btn-sm btn-outline btn-del" @click="archiveProduct(p.id)">Archive</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Create / Edit Modal -->
      <div v-if="modalOpen" class="modal-overlay" @click.self="modalOpen = false">
        <div class="modal-content product-modal">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Hardware Product' : 'Add New Hardware Product' }}</h3>
            <button class="close-btn" @click="modalOpen = false">✕</button>
          </div>

          <form @submit.prevent="saveProduct" class="modal-form">
            <div class="grid-2">
              <div class="input-group">
                <label class="input-label">Product Name *</label>
                <input v-model="form.name" type="text" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Unique SKU *</label>
                <input v-model="form.sku" type="text" class="input-field" required />
              </div>
            </div>

            <div class="grid-3">
              <div class="input-group">
                <label class="input-label">Brand *</label>
                <input v-model="form.brand" type="text" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Category *</label>
                <select v-model="form.categoryId" class="input-field" required>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="input-group">
                <label class="input-label">Status</label>
                <select v-model="form.status" class="input-field">
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div class="grid-3">
              <div class="input-group">
                <label class="input-label">Regular Price ($) *</label>
                <input v-model.number="form.regularPrice" type="number" step="0.01" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Selling Price ($) *</label>
                <input v-model.number="form.sellingPrice" type="number" step="0.01" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Inventory Stock Quantity *</label>
                <input v-model.number="form.stockQuantity" type="number" class="input-field" required />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Short Description *</label>
              <input v-model="form.shortDesc" type="text" class="input-field" required />
            </div>

            <div class="input-group">
              <label class="input-label">Detailed Full Description *</label>
              <textarea v-model="form.description" class="input-field" rows="3" required></textarea>
            </div>

            <div class="input-group">
              <label class="input-label">Primary Image URL</label>
              <input v-model="form.imageUrl" type="url" class="input-field" placeholder="https://images.unsplash.com/..." />
            </div>

            <div class="grid-3">
              <div class="input-group">
                <label class="input-label">Weight</label>
                <input v-model="form.weight" type="text" class="input-field" placeholder="e.g. 250g" />
              </div>
              <div class="input-group">
                <label class="input-label">Dimensions</label>
                <input v-model="form.dimensions" type="text" class="input-field" placeholder="e.g. 18 x 16 x 8 cm" />
              </div>
              <div class="input-group">
                <label class="input-label">Tags (comma-separated)</label>
                <input v-model="form.tags" type="text" class="input-field" placeholder="audio,wireless,premium" />
              </div>
            </div>

            <!-- Flags -->
            <div class="flags-row">
              <label class="checkbox-label">
                <input v-model="form.isFeatured" type="checkbox" />
                <span>Featured Product</span>
              </label>
              <label class="checkbox-label">
                <input v-model="form.isBestSeller" type="checkbox" />
                <span>Best Seller</span>
              </label>
              <label class="checkbox-label">
                <input v-model="form.isTrending" type="checkbox" />
                <span>Trending Product</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="saving">
              {{ saving ? 'Saving Product...' : (isEditing ? 'Update Product' : 'Publish Product to Catalogue') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { api } from '../services/api.js';
import { useToastStore } from '../stores/toast.js';

const toast = useToastStore();

const products = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const modalOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = reactive({
  name: '',
  sku: '',
  brand: 'NovaMarket Labs',
  categoryId: '',
  status: 'PUBLISHED',
  regularPrice: 299.99,
  sellingPrice: 249.99,
  stockQuantity: 30,
  shortDesc: '',
  description: '',
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  weight: '300g',
  dimensions: '18 x 15 x 6 cm',
  tags: 'tech,audio,flagship',
  isFeatured: false,
  isBestSeller: false,
  isTrending: false,
});

const fetchCategories = async () => {
  try {
    const res = await api.get('/api/categories');
    categories.value = res.data;
    if (categories.value.length > 0 && !form.categoryId) {
      form.categoryId = categories.value[0].id;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchProducts = async () => {
  try {
    const query = new URLSearchParams();
    if (searchQuery.value) query.set('q', searchQuery.value);
    if (selectedCategory.value) query.set('categoryId', selectedCategory.value);
    const res = await api.get(`/api/admin/products?${query.toString()}`);
    products.value = res.data.items || [];
  } catch (err) {
    console.error(err);
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.name = '';
  form.sku = `PROD-${Date.now().toString().slice(-5)}`;
  form.shortDesc = '';
  form.description = '';
  modalOpen.value = true;
};

const openEditModal = (p) => {
  isEditing.value = true;
  editingId.value = p.id;
  form.name = p.name;
  form.sku = p.sku;
  form.brand = p.brand;
  form.categoryId = p.categoryId;
  form.status = p.status;
  form.regularPrice = p.regularPrice;
  form.sellingPrice = p.sellingPrice;
  form.stockQuantity = p.stockQuantity;
  form.shortDesc = p.shortDesc;
  form.description = p.description;
  form.imageUrl = p.images[0]?.url || '';
  form.weight = p.weight || '';
  form.dimensions = p.dimensions || '';
  form.tags = p.tags || '';
  form.isFeatured = p.isFeatured;
  form.isBestSeller = p.isBestSeller;
  form.isTrending = p.isTrending;
  modalOpen.value = true;
};

const saveProduct = async () => {
  saving.value = true;
  try {
    const payload = {
      ...form,
      images: [{ url: form.imageUrl, isPrimary: true }],
    };

    if (isEditing.value) {
      await api.put(`/api/admin/products/${editingId.value}`, payload);
      toast.success('Product updated and synced with store catalogue!');
    } else {
      await api.post('/api/admin/products', payload);
      toast.success('Product published successfully!');
    }
    modalOpen.value = false;
    fetchProducts();
  } catch (err) {
    toast.error(err.message || 'Failed to save product');
  } finally {
    saving.value = false;
  }
};

const archiveProduct = async (id) => {
  if (!confirm('Are you sure you want to archive this product?')) return;
  try {
    await api.delete(`/api/admin/products/${id}`);
    toast.success('Product archived');
    fetchProducts();
  } catch (err) {
    toast.error('Failed to archive product');
  }
};

const exportCSV = () => {
  window.open('/api/admin/products/export/csv', '_blank');
  toast.success('Exporting product database to CSV...');
};

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.page-title {
  font-size: 2.3rem;
  margin-top: 0.35rem;
}

.toolbar {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background: var(--bg-surface);
}

.search-box {
  flex: 1;
}

.filter-select {
  width: 240px;
}

.table-card {
  background: var(--bg-surface);
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.9rem;
}

.admin-table th {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
}

.table-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 0.4rem;
  background: #090e1a;
}

.sku-sub {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stock-low {
  color: var(--accent-amber);
  font-weight: 700;
}

.stock-ok {
  color: #6ee7b7;
}

.table-actions {
  display: flex;
  gap: 0.4rem;
}

.btn-del {
  color: var(--accent-rose);
  border-color: rgba(244, 63, 94, 0.3);
}

.btn-del:hover {
  background: rgba(244, 63, 94, 0.1);
}

.product-modal {
  padding: 2.5rem;
  max-width: 720px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.flags-row {
  display: flex;
  gap: 1.5rem;
  margin: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  cursor: pointer;
}

.font-mono {
  font-family: monospace;
}

.w-full {
  width: 100%;
}
</style>
