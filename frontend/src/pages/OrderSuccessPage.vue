<template>
  <div class="success-page section-padding">
    <div class="container success-container">
      <div v-if="loading" class="card text-center p-5">
        <p>Loading confirmed order details...</p>
      </div>

      <div v-else-if="!order" class="card text-center p-5">
        <h2>Order Not Found</h2>
        <p>Could not load confirmation for this order number.</p>
        <router-link to="/" class="btn btn-primary" style="margin-top: 1rem;">Go to Home</router-link>
      </div>

      <div v-else class="success-card card">
        <div class="success-icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <span class="badge badge-success">Order Confirmed & Processing</span>
        <h1 class="success-title">Thank You, {{ order.customerName }}!</h1>
        <p class="success-msg">
          We have received your order and our fulfillment team has started preparing your gear. A formal receipt and courier updates have been sent to <strong>{{ order.customerEmail }}</strong>.
        </p>

        <!-- Order Meta Summary -->
        <div class="order-meta-grid">
          <div class="meta-box">
            <span class="meta-label">Order Number</span>
            <span class="meta-val font-mono">#{{ order.orderNumber }}</span>
          </div>
          <div class="meta-box">
            <span class="meta-label">Payment Status</span>
            <span class="meta-val badge badge-success">{{ order.paymentStatus }}</span>
          </div>
          <div class="meta-box">
            <span class="meta-label">Payment Method</span>
            <span class="meta-val">{{ order.paymentMethod }}</span>
          </div>
          <div class="meta-box">
            <span class="meta-label">Total Amount</span>
            <span class="meta-val highlight">₹{{ Math.round(order.grandTotal) }}</span>
          </div>
        </div>

        <!-- Ordered Items -->
        <div class="items-summary-section">
          <h3>Items in this Order</h3>
          <div class="items-list">
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <div class="item-desc">
                <strong>{{ item.productName }}</strong>
                <span v-if="item.variantName" class="variant-tag">{{ item.variantName }}</span>
                <span class="sku-tag">SKU: {{ item.productSku }}</span>
              </div>
              <div class="item-qty-price">
                <span>{{ item.quantity }} × ₹{{ Math.round(item.unitPrice) }}</span>
                <strong>₹{{ Math.round(item.subtotal) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="actions-row">
          <router-link :to="`/track?orderNumber=${order.orderNumber}&email=${order.customerEmail}`" class="btn btn-primary">
            Track Package Status
          </router-link>
          <router-link to="/shop" class="btn btn-secondary">
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../services/api.js';

const route = useRoute();
const order = ref(null);
const loading = ref(true);

const fetchOrder = async () => {
  try {
    const res = await api.get(`/api/orders/${route.params.orderNumber}`);
    order.value = res.data;
  } catch (err) {
    console.error('Failed to load order:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.success-container {
  max-width: 760px;
}

.success-card {
  padding: 3.5rem 3rem;
  text-align: center;
  background: var(--bg-surface);
}

.success-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-title {
  font-size: 2.2rem;
  margin: 0.85rem 0;
}

.success-msg {
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.order-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-surface-elevated);
  border-radius: 0.75rem;
  border: 1px solid var(--border-subtle);
  margin-bottom: 2.5rem;
  text-align: left;
}

.meta-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.meta-val {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.highlight {
  color: #6ee7b7;
  font-size: 1.15rem;
}

.font-mono {
  font-family: monospace;
}

.items-summary-section {
  text-align: left;
  margin-bottom: 2.5rem;
}

.items-summary-section h3 {
  font-size: 1.15rem;
  margin-bottom: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: var(--bg-surface-elevated);
  border-radius: 0.5rem;
  border: 1px solid var(--border-subtle);
}

.item-desc {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.variant-tag {
  font-size: 0.8rem;
  color: #a5b4fc;
}

.sku-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.item-qty-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.actions-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 600px) {
  .order-meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .actions-row {
    flex-direction: column;
  }
}
</style>
