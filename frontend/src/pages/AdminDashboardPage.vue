<template>
  <div class="admin-dashboard section-padding">
    <div class="container">
      <!-- Admin Top Nav Header -->
      <div class="admin-header">
        <div>
          <span class="badge badge-primary">Enterprise Business Suite</span>
          <h1 class="page-title">Executive Business Intelligence</h1>
        </div>
        <div class="admin-nav-links">
          <router-link to="/admin" class="btn btn-sm btn-primary">Dashboard</router-link>
          <router-link to="/admin/products" class="btn btn-sm btn-secondary">Products & Inventory</router-link>
          <router-link to="/admin/orders" class="btn btn-sm btn-secondary">Order Fulfillment</router-link>
          <router-link to="/admin/coupons" class="btn btn-sm btn-secondary">Promotions & Deals</router-link>
        </div>
      </div>

      <div v-if="loading" class="loading-state card p-5 text-center">
        <p>Synthesizing real-time analytics from PostgreSQL database...</p>
      </div>

      <div v-else-if="analytics" class="dashboard-body">
        <!-- Top Metrics Row -->
        <div class="metrics-grid grid-4">
          <div class="metric-card card">
            <span class="metric-label">Total Gross Sales</span>
            <span class="metric-val text-gradient">₹{{ Math.round(analytics.totalRevenue) }}</span>
            <span class="metric-sub">Verified ledger transactions</span>
          </div>

          <div class="metric-card card">
            <span class="metric-label">Completed Orders</span>
            <span class="metric-val">{{ analytics.totalOrders }}</span>
            <span class="metric-sub">Processed through checkout</span>
          </div>

          <div class="metric-card card">
            <span class="metric-label">Catalogue Products</span>
            <span class="metric-val">{{ analytics.totalProducts }}</span>
            <span class="metric-sub">Active in marketplace</span>
          </div>

          <div class="metric-card card">
            <span class="metric-label">Average Order Value (AOV)</span>
            <span class="metric-val">₹{{ Math.round(analytics.averageOrderValue) }}</span>
            <span class="metric-sub">Conversion Rate: {{ analytics.conversionRate }}</span>
          </div>
        </div>

        <!-- 7-Day Revenue Trend Chart & Low-Stock Alerts -->
        <div class="chart-and-alerts-grid">
          <!-- SVG Revenue Chart -->
          <div class="chart-card card">
            <div class="chart-header">
              <h3>7-Day Sales Volume Trend</h3>
              <span class="chart-legend">● Daily Gross Revenue</span>
            </div>
            <div class="svg-chart-container">
              <svg viewBox="0 0 500 180" class="revenue-chart-svg">
                <!-- Grid Lines -->
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.06)" />

                <!-- Chart Bars -->
                <g v-for="(item, idx) in analytics.revenueChart" :key="idx">
                  <rect
                    :x="25 + idx * 68"
                    :y="Math.max(20, 140 - (item.revenue / (maxChartRevenue || 1)) * 110)"
                    width="36"
                    :height="Math.max(8, (item.revenue / (maxChartRevenue || 1)) * 110)"
                    rx="6"
                    fill="url(#barGradient)"
                  />
                  <!-- Value Label -->
                  <text
                    :x="43 + idx * 68"
                    :y="Math.max(16, 130 - (item.revenue / (maxChartRevenue || 1)) * 110)"
                    font-size="10"
                    fill="#a5b4fc"
                    text-anchor="middle"
                  >
                    ${{ Math.round(item.revenue) }}
                  </text>
                  <!-- Day Label -->
                  <text
                    :x="43 + idx * 68"
                    y="160"
                    font-size="11"
                    fill="#94a3b8"
                    text-anchor="middle"
                  >
                    {{ item.day }}
                  </text>
                </g>

                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#818cf8" />
                    <stop offset="100%" stop-color="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <!-- Low Stock Alerts Box -->
          <div class="alerts-card card">
            <div class="alerts-header">
              <h3>Low Stock Inventory Alerts</h3>
              <span class="badge badge-warning">{{ analytics.lowStockAlerts.length }} Items Low</span>
            </div>
            <div v-if="analytics.lowStockAlerts.length === 0" class="p-3 text-muted">
              All inventory levels are healthy.
            </div>
            <div v-else class="alerts-list">
              <div v-for="item in analytics.lowStockAlerts" :key="item.id" class="alert-row">
                <div class="alert-info">
                  <strong>{{ item.name }}</strong>
                  <span class="sku-tag">SKU: {{ item.sku }}</span>
                </div>
                <div class="alert-stock">
                  <span class="stock-num">{{ item.stockQuantity }} units left</span>
                  <router-link :to="`/admin/products`" class="btn btn-sm btn-outline">Restock</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Customer Orders Table -->
        <div class="recent-orders-card card">
          <div class="table-header">
            <h3>Recent Customer Orders</h3>
            <router-link to="/admin/orders" class="btn btn-outline btn-sm">Manage All Orders &rarr;</router-link>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in analytics.recentOrders" :key="order.id">
                  <td class="font-mono">#{{ order.orderNumber }}</td>
                  <td>{{ order.customerName }}</td>
                  <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
                  <td><span class="badge badge-success">{{ order.paymentStatus }}</span></td>
                  <td>
                    <span class="badge" :class="order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'">
                      {{ order.status }}
                    </span>
                  </td>
                  <td><strong>${{ order.grandTotal.toFixed(2) }}</strong></td>
                  <td>
                    <router-link :to="`/admin/orders`" class="btn btn-sm btn-secondary">
                      Update
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../services/api.js';

const loading = ref(true);
const analytics = ref(null);

const maxChartRevenue = computed(() => {
  if (!analytics.value?.revenueChart?.length) return 100;
  return Math.max(...analytics.value.revenueChart.map((d) => d.revenue), 100);
});

const fetchAnalytics = async () => {
  try {
    const res = await api.get('/api/admin/analytics');
    analytics.value = res.data;
  } catch (err) {
    console.error('Failed to load admin analytics:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnalytics();
});
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.page-title {
  font-size: 2.4rem;
  margin-top: 0.35rem;
}

.admin-nav-links {
  display: flex;
  gap: 0.75rem;
}

.dashboard-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metric-card {
  padding: 1.75rem;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.metric-val {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.metric-sub {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.chart-and-alerts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.chart-card,
.alerts-card,
.recent-orders-card {
  padding: 2rem;
  background: var(--bg-surface);
}

.chart-header,
.alerts-header,
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3,
.alerts-header h3,
.table-header h3 {
  font-size: 1.25rem;
}

.chart-legend {
  font-size: 0.8rem;
  color: #818cf8;
}

.revenue-chart-svg {
  width: 100%;
  height: auto;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 240px;
  overflow-y: auto;
}

.alert-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-surface-elevated);
  border-radius: 0.5rem;
  border-left: 3px solid var(--accent-amber);
}

.alert-info {
  display: flex;
  flex-direction: column;
}

.sku-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.alert-stock {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stock-num {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent-amber);
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th,
.admin-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.9rem;
}

.admin-table th {
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.font-mono {
  font-family: monospace;
}

@media (max-width: 992px) {
  .chart-and-alerts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
