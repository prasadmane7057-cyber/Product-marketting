<template>
  <div class="account-page section-padding">
    <div class="container">
      <div class="account-header">
        <div class="user-greeting">
          <div class="user-big-avatar">{{ auth.user?.firstName[0] }}</div>
          <div>
            <h1 class="page-title">Welcome, {{ auth.user?.firstName }} {{ auth.user?.lastName }}</h1>
            <span class="user-email">{{ auth.user?.email }}</span>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" @click="auth.logout">
          Sign Out
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="account-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'orders' }]"
          @click="activeTab = 'orders'"
        >
          My Orders & Invoices ({{ orders.length }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'profile' }]"
          @click="activeTab = 'profile'"
        >
          Profile & Address Settings
        </button>
      </div>

      <!-- Tab 1: Orders -->
      <div v-if="activeTab === 'orders'" class="tab-pane">
        <div v-if="loadingOrders" class="loading-state card p-5 text-center">
          <p>Loading your past orders...</p>
        </div>

        <div v-else-if="orders.length === 0" class="empty-orders card text-center">
          <h3>No past purchases found</h3>
          <p>When you complete a purchase, your order history, invoices, and shipment tracking will appear here.</p>
          <router-link to="/shop" class="btn btn-primary" style="margin-top: 1rem;">Browse Catalogue</router-link>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card card">
            <div class="order-card-header">
              <div>
                <span class="order-number font-mono">#{{ order.orderNumber }}</span>
                <span class="order-date">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="status-tags">
                <span class="badge" :class="getStatusBadgeClass(order.status)">
                  {{ order.status }}
                </span>
                <span class="badge badge-success">
                  {{ order.paymentStatus }}
                </span>
              </div>
            </div>

            <!-- Items Snapshot -->
            <div class="order-items-snapshot">
              <div v-for="item in order.items" :key="item.id" class="item-snapshot-row">
                <span class="item-name">{{ item.productName }} <small v-if="item.variantName">({{ item.variantName }})</small></span>
                <span class="item-qty">Qty: {{ item.quantity }}</span>
                <span class="item-price">${{ item.subtotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Footer: Grand Total & Tracking -->
            <div class="order-card-footer">
              <div class="total-box">
                <span class="total-label">Grand Total:</span>
                <span class="total-amount">${{ order.grandTotal.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <router-link
                  :to="`/track?orderNumber=${order.orderNumber}&email=${order.customerEmail}`"
                  class="btn btn-secondary btn-sm"
                >
                  Track Package
                </router-link>
                <router-link
                  :to="`/order-success/${order.orderNumber}`"
                  class="btn btn-outline btn-sm"
                >
                  View Invoice
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Profile & Addresses -->
      <div v-else class="tab-pane">
        <div class="profile-layout grid-2">
          <!-- Profile Form -->
          <div class="profile-card card">
            <h3>Personal Information</h3>
            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="input-group">
                <label class="input-label">First Name</label>
                <input v-model="profileForm.firstName" type="text" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Last Name</label>
                <input v-model="profileForm.lastName" type="text" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Phone Number</label>
                <input v-model="profileForm.phone" type="tel" class="input-field" />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                {{ savingProfile ? 'Saving...' : 'Update Profile' }}
              </button>
            </form>
          </div>

          <!-- Saved Shipping Address -->
          <div class="address-card card">
            <h3>Default Delivery Address</h3>
            <div v-if="auth.user?.addresses?.length > 0" class="address-preview">
              <p><strong>{{ auth.user.addresses[0].fullName }}</strong></p>
              <p>{{ auth.user.addresses[0].addressLine1 }}</p>
              <p v-if="auth.user.addresses[0].addressLine2">{{ auth.user.addresses[0].addressLine2 }}</p>
              <p>{{ auth.user.addresses[0].city }}, {{ auth.user.addresses[0].state }} {{ auth.user.addresses[0].postalCode }}</p>
              <p>{{ auth.user.addresses[0].country }}</p>
              <p>Phone: {{ auth.user.addresses[0].phone }}</p>
            </div>
            <div v-else class="address-preview">
              <p class="text-muted">No saved address found. Your address will be saved upon checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { api } from '../services/api.js';
import { useToastStore } from '../stores/toast.js';

const auth = useAuthStore();
const toast = useToastStore();

const activeTab = ref('orders');
const orders = ref([]);
const loadingOrders = ref(true);
const savingProfile = ref(false);

const profileForm = reactive({
  firstName: auth.user?.firstName || '',
  lastName: auth.user?.lastName || '',
  phone: auth.user?.phone || '',
});

const getStatusBadgeClass = (status) => {
  if (status === 'DELIVERED') return 'badge-success';
  if (status === 'SHIPPED') return 'badge-primary';
  if (status === 'PROCESSING') return 'badge-warning';
  return 'badge-discount';
};

const fetchOrders = async () => {
  try {
    const res = await api.get('/api/orders/my-orders');
    orders.value = res.data || [];
  } catch (err) {
    console.error('Failed to load orders:', err);
  } finally {
    loadingOrders.value = false;
  }
};

const updateProfile = async () => {
  savingProfile.value = true;
  try {
    const res = await api.put('/api/auth/profile', profileForm);
    auth.user = { ...auth.user, ...res.data };
    localStorage.setItem('novamarket_user', JSON.stringify(auth.user));
    toast.success('Profile updated successfully!');
  } catch (err) {
    toast.error(err.message || 'Failed to update profile');
  } finally {
    savingProfile.value = false;
  }
};

onMounted(() => {
  auth.fetchMe();
  fetchOrders();
});
</script>

<style scoped>
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.user-big-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, hsl(245, 82%, 46%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.page-title {
  font-size: 1.8rem;
  margin-bottom: 0.2rem;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.account-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-subtle);
}

.account-tabs .tab-btn {
  padding: 0.85rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}

.account-tabs .tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  padding: 1.75rem;
  background: var(--bg-surface);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.order-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-right: 0.75rem;
}

.order-date {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.status-tags {
  display: flex;
  gap: 0.5rem;
}

.order-items-snapshot {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.item-snapshot-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.total-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.total-amount {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
}

.order-actions {
  display: flex;
  gap: 0.6rem;
}

.profile-card,
.address-card {
  padding: 2rem;
  background: var(--bg-surface);
}

.profile-card h3,
.address-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-preview p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.font-mono {
  font-family: monospace;
}

.empty-orders {
  padding: 4rem 2rem;
}
</style>
