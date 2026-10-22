<template>
  <div class="admin-coupons section-padding">
    <div class="container">
      <div class="admin-header">
        <div>
          <span class="badge badge-primary">Promotions & Retention</span>
          <h1 class="page-title">Discount Coupon Campaigns</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-sm" @click="modalOpen = true">
            + Create New Coupon
          </button>
          <router-link to="/admin" class="btn btn-secondary btn-sm">&larr; Back to Dashboard</router-link>
        </div>
      </div>

      <!-- Coupons Table -->
      <div class="table-card card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Description</th>
                <th>Discount Type & Value</th>
                <th>Min. Purchase</th>
                <th>Redemptions</th>
                <th>Validity Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in coupons" :key="c.id">
                <td class="font-mono">
                  <span class="code-pill"><strong>{{ c.code }}</strong></span>
                </td>
                <td>{{ c.description }}</td>
                <td>
                  <strong>{{ c.discountValue }}{{ c.discountType === 'PERCENTAGE' ? '%' : '$' }}</strong>
                </td>
                <td>${{ c.minOrderAmount.toFixed(2) }}</td>
                <td>
                  <span>{{ c.usageCount }} / {{ c.usageLimit || '∞' }} used</span>
                </td>
                <td>{{ new Date(c.endDate).toLocaleDateString() }}</td>
                <td>
                  <span class="badge" :class="c.isActive ? 'badge-success' : 'badge-warning'">
                    {{ c.isActive ? 'Active' : 'Expired' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Coupon Modal -->
      <div v-if="modalOpen" class="modal-overlay" @click.self="modalOpen = false">
        <div class="modal-content coupon-modal">
          <div class="modal-header">
            <h3>Create Promotional Coupon</h3>
            <button class="close-btn" @click="modalOpen = false">✕</button>
          </div>

          <form @submit.prevent="createCoupon" class="modal-form">
            <div class="grid-2">
              <div class="input-group">
                <label class="input-label">Coupon Code (Uppercase) *</label>
                <input v-model="form.code" type="text" class="input-field" placeholder="e.g. FLASH20" required />
              </div>
              <div class="input-group">
                <label class="input-label">Discount Type *</label>
                <select v-model="form.discountType" class="input-field">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            <div class="grid-3">
              <div class="input-group">
                <label class="input-label">Discount Value *</label>
                <input v-model.number="form.discountValue" type="number" step="0.1" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Min. Order Subtotal ($)</label>
                <input v-model.number="form.minOrderAmount" type="number" class="input-field" />
              </div>
              <div class="input-group">
                <label class="input-label">Usage Limit</label>
                <input v-model.number="form.usageLimit" type="number" class="input-field" />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Campaign Description *</label>
              <input v-model="form.description" type="text" class="input-field" placeholder="Save 20% on all orders" required />
            </div>

            <div class="input-group">
              <label class="input-label">Expiration Date *</label>
              <input v-model="form.endDate" type="date" class="input-field" required />
            </div>

            <button type="submit" class="btn btn-primary w-full" :disabled="saving">
              {{ saving ? 'Creating...' : 'Activate Promotional Coupon' }}
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

const coupons = ref([]);
const modalOpen = ref(false);
const saving = ref(false);

const form = reactive({
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 15,
  minOrderAmount: 100,
  usageLimit: 250,
  endDate: '2027-12-31',
});

const fetchCoupons = async () => {
  try {
    const res = await api.get('/api/admin/coupons');
    coupons.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const createCoupon = async () => {
  saving.value = true;
  try {
    await api.post('/api/admin/coupons', form);
    toast.success(`Coupon code ${form.code} created and live!`);
    modalOpen.value = false;
    form.code = '';
    form.description = '';
    fetchCoupons();
  } catch (err) {
    toast.error(err.message || 'Failed to create coupon');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchCoupons();
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

.code-pill {
  padding: 0.25rem 0.6rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.4rem;
  color: #a5b4fc;
}

.coupon-modal {
  padding: 2.5rem;
  max-width: 600px;
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

.font-mono {
  font-family: monospace;
}

.w-full {
  width: 100%;
}
</style>
