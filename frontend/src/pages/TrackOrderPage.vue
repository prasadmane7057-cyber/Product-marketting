<template>
  <div class="track-page section-padding">
    <div class="container track-container">
      <div class="track-header text-center">
        <span class="badge badge-primary">Real-Time Logistics</span>
        <h1 class="page-title">Track Your Shipment</h1>
        <p class="page-desc">Enter your order number and email address to view live courier tracking information.</p>
      </div>

      <!-- Search Box -->
      <form @submit.prevent="handleTrack" class="track-form card">
        <div class="grid-2">
          <div class="input-group">
            <label class="input-label">Order Number *</label>
            <input
              v-model="orderNumber"
              type="text"
              class="input-field"
              placeholder="e.g. ORD-20261021-0001"
              required
            />
          </div>
          <div class="input-group">
            <label class="input-label">Customer Email *</label>
            <input
              v-model="email"
              type="email"
              class="input-field"
              placeholder="e.g. customer@novamarket.com"
              required
            />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
          <span v-if="loading">Locating Package...</span>
          <span v-else>Track Package</span>
        </button>
      </form>

      <!-- Tracking Results Timeline -->
      <div v-if="trackingData" class="tracking-results card">
        <div class="result-top">
          <div>
            <span class="badge badge-success">{{ trackingData.status }}</span>
            <h2 class="order-num">#{{ trackingData.orderNumber }}</h2>
          </div>
          <div v-if="trackingData.trackingNumber" class="carrier-box">
            <span class="carrier-name">{{ trackingData.trackingCarrier || 'FedEx Express' }}</span>
            <strong class="trk-num">{{ trackingData.trackingNumber }}</strong>
            <a
              v-if="trackingData.trackingUrl"
              :href="trackingData.trackingUrl"
              target="_blank"
              rel="noopener"
              class="carrier-link"
            >
              Open Carrier Tracker &rarr;
            </a>
          </div>
        </div>

        <!-- 4-Stage Visual Timeline -->
        <div class="timeline-row">
          <div class="timeline-step" :class="{ completed: stepIndex >= 1 }">
            <div class="step-circle">✓</div>
            <span class="step-label">Placed</span>
          </div>
          <div class="timeline-line" :class="{ completed: stepIndex >= 2 }"></div>
          <div class="timeline-step" :class="{ completed: stepIndex >= 2 }">
            <div class="step-circle">{{ stepIndex >= 2 ? '✓' : '2' }}</div>
            <span class="step-label">Processing</span>
          </div>
          <div class="timeline-line" :class="{ completed: stepIndex >= 3 }"></div>
          <div class="timeline-step" :class="{ completed: stepIndex >= 3 }">
            <div class="step-circle">{{ stepIndex >= 3 ? '✓' : '3' }}</div>
            <span class="step-label">In Transit</span>
          </div>
          <div class="timeline-line" :class="{ completed: stepIndex >= 4 }"></div>
          <div class="timeline-step" :class="{ completed: stepIndex >= 4 }">
            <div class="step-circle">{{ stepIndex >= 4 ? '✓' : '4' }}</div>
            <span class="step-label">Delivered</span>
          </div>
        </div>

        <!-- Items in Shipment -->
        <div class="shipment-items">
          <h3>Included Hardware ({{ trackingData.items.length }})</h3>
          <div class="items-list">
            <div v-for="(item, idx) in trackingData.items" :key="idx" class="item-summary-row">
              <span>{{ item.productName }} <small v-if="item.variantName">({{ item.variantName }})</small></span>
              <span>Qty: {{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../services/api.js';
import { useToastStore } from '../stores/toast.js';

const route = useRoute();
const toast = useToastStore();

const orderNumber = ref(route.query.orderNumber || '');
const email = ref(route.query.email || '');
const loading = ref(false);
const trackingData = ref(null);

const stepIndex = computed(() => {
  if (!trackingData.value) return 1;
  const s = trackingData.value.status;
  if (s === 'DELIVERED') return 4;
  if (s === 'SHIPPED') return 3;
  if (s === 'PROCESSING') return 2;
  return 1;
});

const handleTrack = async () => {
  if (!orderNumber.value || !email.value) return;
  loading.value = true;
  try {
    const res = await api.get(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.value.trim())}&email=${encodeURIComponent(email.value.trim())}`);
    trackingData.value = res.data;
  } catch (err) {
    toast.error(err.message || 'No tracking information found for this order');
    trackingData.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (orderNumber.value && email.value) {
    handleTrack();
  }
});
</script>

<style scoped>
.track-container {
  max-width: 760px;
}

.text-center {
  text-align: center;
}

.track-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.5rem;
  margin: 0.5rem 0;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
}

.track-form {
  padding: 2rem;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.tracking-results {
  padding: 2.5rem;
  background: var(--bg-surface);
}

.result-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.order-num {
  font-size: 1.6rem;
  margin-top: 0.4rem;
}

.carrier-box {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.carrier-name {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
}

.trk-num {
  font-family: monospace;
  color: #a5b4fc;
}

.carrier-link {
  font-size: 0.8rem;
  color: var(--primary);
  text-decoration: underline;
  margin-top: 0.2rem;
}

.timeline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-surface-elevated);
  border: 2px solid var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.timeline-step.completed .step-circle {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 0 12px var(--primary-glow);
}

.step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.timeline-step.completed .step-label {
  color: var(--text-main);
}

.timeline-line {
  flex-grow: 1;
  height: 3px;
  background: var(--border-medium);
  margin: 0 0.5rem -1.2rem;
}

.timeline-line.completed {
  background: var(--primary);
}

.shipment-items h3 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background: var(--bg-surface-elevated);
  border-radius: 0.4rem;
  font-size: 0.88rem;
}

.w-full {
  width: 100%;
}
</style>
