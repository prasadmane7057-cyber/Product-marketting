<template>
  <div class="admin-orders section-padding">
    <div class="container">
      <div class="admin-header">
        <div>
          <span class="badge badge-primary">Fulfillment & Courier Logistics</span>
          <h1 class="page-title">Order Management & Fulfillment</h1>
        </div>
        <router-link to="/admin" class="btn btn-secondary btn-sm">&larr; Back to Dashboard</router-link>
      </div>

      <!-- Toolbar -->
      <div class="toolbar card">
        <input
          v-model="searchQuery"
          type="text"
          class="input-field search-box"
          placeholder="Search by order #, customer name, email..."
          @input="fetchOrders"
        />
        <select v-model="selectedStatus" class="input-field status-select" @change="fetchOrders">
          <option value="">All Fulfillment Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <!-- Orders Table -->
      <div class="table-card card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Tracking</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="font-mono">#{{ order.orderNumber }}</td>
                <td>
                  <strong>{{ order.customerName }}</strong>
                  <span class="sub-email">{{ order.customerEmail }}</span>
                </td>
                <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
                <td><strong>₹{{ Math.round(order.grandTotal) }}</strong></td>
                <td>
                  <span class="badge badge-success">{{ order.paymentStatus }}</span>
                  <small class="pay-method-tag">{{ order.paymentMethod }}</small>
                </td>
                <td>
                  <select
                    :value="order.status"
                    class="status-dropdown"
                    @change="updateStatus(order.id, $event.target.value)"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </td>
                <td>
                  <span v-if="order.trackingNumber" class="font-mono text-cyan">
                    {{ order.trackingCarrier || 'FedEx' }}: {{ order.trackingNumber }}
                  </span>
                  <span v-else class="text-muted">Unassigned</span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-sm btn-secondary" @click="openTrackingModal(order)">
                      Courier Info
                    </button>
                    <button
                      v-if="order.status !== 'REFUNDED'"
                      class="btn btn-sm btn-outline btn-refund"
                      @click="processRefund(order.id)"
                    >
                      Refund
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tracking Modal -->
      <div v-if="trackingModalOpen" class="modal-overlay" @click.self="trackingModalOpen = false">
        <div class="modal-content tracking-modal">
          <div class="modal-header">
            <h3>Update Shipment Tracking for #{{ activeOrder?.orderNumber }}</h3>
            <button class="close-btn" @click="trackingModalOpen = false">✕</button>
          </div>
          <form @submit.prevent="saveTracking" class="modal-form">
            <div class="input-group">
              <label class="input-label">Courier Carrier</label>
              <input v-model="trackingForm.trackingCarrier" type="text" class="input-field" placeholder="e.g. FedEx Express / BlueDart" required />
            </div>
            <div class="input-group">
              <label class="input-label">Tracking Airway Bill (AWB) / Number</label>
              <input v-model="trackingForm.trackingNumber" type="text" class="input-field" placeholder="TRK-9928172" required />
            </div>
            <div class="input-group">
              <label class="input-label">Direct Tracking Web URL</label>
              <input v-model="trackingForm.trackingUrl" type="url" class="input-field" placeholder="https://fedex.com/track?id=..." />
            </div>
            <button type="submit" class="btn btn-primary w-full" :disabled="savingTracking">
              {{ savingTracking ? 'Saving...' : 'Update Courier Dispatch' }}
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

const orders = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('');
const trackingModalOpen = ref(false);
const activeOrder = ref(null);
const savingTracking = ref(false);

const trackingForm = reactive({
  trackingCarrier: 'FedEx Express',
  trackingNumber: '',
  trackingUrl: '',
});

const fetchOrders = async () => {
  try {
    const query = new URLSearchParams();
    if (searchQuery.value) query.set('q', searchQuery.value);
    if (selectedStatus.value) query.set('status', selectedStatus.value);
    const res = await api.get(`/api/admin/orders?${query.toString()}`);
    orders.value = res.data.items || [];
  } catch (err) {
    console.error(err);
  }
};

const updateStatus = async (orderId, newStatus) => {
  try {
    await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
    toast.success(`Order status changed to ${newStatus}`);
    fetchOrders();
  } catch (err) {
    toast.error('Failed to update status');
  }
};

const openTrackingModal = (order) => {
  activeOrder.value = order;
  trackingForm.trackingCarrier = order.trackingCarrier || 'FedEx Express';
  trackingForm.trackingNumber = order.trackingNumber || `TRK-NV-${Math.floor(100000 + Math.random() * 900000)}`;
  trackingForm.trackingUrl = order.trackingUrl || `https://fedex.com/track?id=${trackingForm.trackingNumber}`;
  trackingModalOpen.value = true;
};

const saveTracking = async () => {
  savingTracking.value = true;
  try {
    await api.put(`/api/admin/orders/${activeOrder.value.id}/status`, {
      status: 'SHIPPED',
      trackingCarrier: trackingForm.trackingCarrier,
      trackingNumber: trackingForm.trackingNumber,
      trackingUrl: trackingForm.trackingUrl,
    });
    toast.success('Shipment tracking saved and status set to SHIPPED!');
    trackingModalOpen.value = false;
    fetchOrders();
  } catch (err) {
    toast.error('Failed to update tracking');
  } finally {
    savingTracking.value = false;
  }
};

const processRefund = async (orderId) => {
  const reason = prompt('Please enter refund justification:');
  if (!reason) return;

  try {
    await api.post(`/api/admin/orders/${orderId}/refund`, {
      reason,
      restock: true,
    });
    toast.success('Refund processed and items restocked into inventory!');
    fetchOrders();
  } catch (err) {
    toast.error(err.message || 'Refund failed');
  }
};

onMounted(() => {
  fetchOrders();
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

.status-select {
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
  font-size: 0.88rem;
}

.admin-table th {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
}

.sub-email {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pay-method-tag {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.status-dropdown {
  padding: 0.35rem 0.6rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 0.4rem;
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 600;
}

.text-cyan {
  color: var(--accent-cyan);
}

.action-btns {
  display: flex;
  gap: 0.4rem;
}

.btn-refund {
  color: var(--accent-rose);
  border-color: rgba(244, 63, 94, 0.3);
}

.btn-refund:hover {
  background: rgba(244, 63, 94, 0.1);
}

.tracking-modal {
  padding: 2.5rem;
  max-width: 540px;
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
