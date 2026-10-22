<template>
  <div class="checkout-page section-padding">
    <div class="container">
      <div class="checkout-header">
        <h1 class="page-title">Secure Express Checkout</h1>
        <p class="page-desc">256-Bit SSL Encrypted & Verified Server-Side Transaction</p>
      </div>

      <!-- Empty State -->
      <div v-if="cart.items.length === 0" class="empty-checkout card">
        <h3>Your shopping bag is empty</h3>
        <p>Please select items from our catalogue before proceeding to checkout.</p>
        <router-link to="/shop" class="btn btn-primary">Return to Shop</router-link>
      </div>

      <!-- Checkout Grid -->
      <form v-else @submit.prevent="handleCheckout" class="checkout-layout">
        <!-- Left: Customer Information & Delivery -->
        <div class="checkout-forms">
          <!-- Contact Details -->
          <div class="form-section card">
            <div class="section-title-row">
              <span class="step-num">1</span>
              <h3>Contact Information</h3>
            </div>
            <div class="grid-2">
              <div class="input-group">
                <label class="input-label">Full Name *</label>
                <input
                  v-model="form.customerName"
                  type="text"
                  class="input-field"
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>
              <div class="input-group">
                <label class="input-label">Email Address (for order receipts) *</label>
                <input
                  v-model="form.customerEmail"
                  type="email"
                  class="input-field"
                  placeholder="alex@example.com"
                  required
                />
              </div>
            </div>
            <div class="input-group" style="margin-top: 1rem;">
              <label class="input-label">Phone Number (for courier updates) *</label>
              <input
                v-model="form.customerPhone"
                type="tel"
                class="input-field"
                placeholder="+1 555-0199"
                required
              />
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="form-section card">
            <div class="section-title-row">
              <span class="step-num">2</span>
              <h3>Delivery Address</h3>
            </div>
            <div class="input-group">
              <label class="input-label">Street Address *</label>
              <input
                v-model="form.addressLine1"
                type="text"
                class="input-field"
                placeholder="742 Evergreen Terrace"
                required
              />
            </div>
            <div class="input-group" style="margin-top: 1rem;">
              <label class="input-label">Apartment, Suite, Unit (Optional)</label>
              <input
                v-model="form.addressLine2"
                type="text"
                class="input-field"
                placeholder="Suite 4B"
              />
            </div>
            <div class="grid-3" style="margin-top: 1rem;">
              <div class="input-group">
                <label class="input-label">City *</label>
                <input
                  v-model="form.city"
                  type="text"
                  class="input-field"
                  placeholder="Springfield"
                  required
                />
              </div>
              <div class="input-group">
                <label class="input-label">State / Province *</label>
                <input
                  v-model="form.state"
                  type="text"
                  class="input-field"
                  placeholder="Oregon"
                  required
                />
              </div>
              <div class="input-group">
                <label class="input-label">Postal / PIN Code *</label>
                <input
                  v-model="form.postalCode"
                  type="text"
                  class="input-field"
                  placeholder="97477"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div class="form-section card">
            <div class="section-title-row">
              <span class="step-num">3</span>
              <h3>Payment Method</h3>
            </div>
            <div class="payment-options">
              <label class="payment-option card" :class="{ selected: form.paymentMethod === 'TEST_CARD' }">
                <input
                  type="radio"
                  name="payment"
                  value="TEST_CARD"
                  v-model="form.paymentMethod"
                />
                <div class="payment-desc">
                  <div class="pay-title-row">
                    <strong>Online Card / Gateway Test Mode</strong>
                    <span class="badge badge-success">Instant Processing</span>
                  </div>
                  <p>Verified sandbox test gateway with immediate simulated order confirmation.</p>
                </div>
              </label>

              <label class="payment-option card" :class="{ selected: form.paymentMethod === 'RAZORPAY' }">
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  v-model="form.paymentMethod"
                />
                <div class="payment-desc">
                  <div class="pay-title-row">
                    <strong>Razorpay Checkout (Test Mode)</strong>
                    <span class="badge badge-primary">UPI, Cards, NetBanking</span>
                  </div>
                  <p>Standard Razorpay integration supporting all payment gateways in test mode.</p>
                </div>
              </label>

              <label class="payment-option card" :class="{ selected: form.paymentMethod === 'COD' }">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  v-model="form.paymentMethod"
                />
                <div class="payment-desc">
                  <div class="pay-title-row">
                    <strong>Cash on Delivery (COD)</strong>
                  </div>
                  <p>Pay cash or via mobile UPI upon physical courier handover.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div class="checkout-summary-col">
          <div class="summary-card card">
            <h3>Order Summary ({{ cart.totalItems }} items)</h3>

            <!-- Item Mini List -->
            <div class="checkout-items">
              <div v-for="item in cart.items" :key="item.id" class="checkout-item">
                <img :src="item.image || '/uploads/aftershave-lotion-pedestal.png'" :alt="item.productName" class="item-thumb" />
                <div class="item-info">
                  <span class="item-title">{{ item.productName }}</span>
                  <span class="item-qty">Qty: {{ item.quantity }} × ₹{{ Math.round(item.unitPrice) }}</span>
                </div>
                <span class="item-price">₹{{ Math.round(item.lineTotal) }}</span>
              </div>
            </div>

            <!-- Coupon Input -->
            <div class="coupon-section">
              <div v-if="!cart.appliedCoupon" class="coupon-row">
                <input
                  v-model="couponInput"
                  type="text"
                  class="input-field coupon-field"
                  placeholder="Coupon code (e.g. WELCOME10)"
                />
                <button type="button" class="btn btn-secondary btn-sm" @click="applyCoupon">
                  Apply
                </button>
              </div>
              <div v-else class="applied-badge">
                <span>🏷️ Code <strong>{{ cart.appliedCoupon.code }}</strong> applied</span>
                <button type="button" class="btn-remove" @click="cart.removeCoupon">✕</button>
              </div>
            </div>

            <!-- Totals Breakdown -->
            <div class="totals-breakdown">
              <div class="breakdown-row">
                <span>Subtotal</span>
                <span>₹{{ Math.round(cart.subtotal) }}</span>
              </div>
              <div v-if="cart.discountAmount > 0" class="breakdown-row discount-row">
                <span>Discount</span>
                <span>-₹{{ Math.round(cart.discountAmount) }}</span>
              </div>
              <div class="breakdown-row">
                <span>Shipping</span>
                <span>{{ cart.shippingFee === 0 ? 'FREE' : `₹${Math.round(cart.shippingFee)}` }}</span>
              </div>
              <div class="breakdown-row">
                <span>Estimated Tax (5%)</span>
                <span>₹{{ Math.round(cart.estimatedTax) }}</span>
              </div>
              <div class="breakdown-row grand-total-row">
                <span>Total Due</span>
                <span class="grand-total">₹{{ Math.round(cart.grandTotal) }}</span>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg w-full submit-order-btn"
              :disabled="submitting"
            >
              <span v-if="submitting">Processing Secure Order...</span>
              <span v-else>Place Order Now (₹{{ Math.round(cart.grandTotal) }})</span>
            </button>

            <div class="security-note">
              🔒 Bank-grade 256-bit SSL encryption. We never store raw card numbers.
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart.js';
import { useAuthStore } from '../stores/auth.js';
import { useToastStore } from '../stores/toast.js';
import { api } from '../services/api.js';

const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore();
const toast = useToastStore();

const couponInput = ref('');
const submitting = ref(false);

const form = reactive({
  customerName: auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : 'Alex Morgan',
  customerEmail: auth.user ? auth.user.email : 'customer@novamarket.com',
  customerPhone: auth.user?.phone || '+1 555-0144-88',
  addressLine1: '742 Evergreen Terrace',
  addressLine2: 'Suite 4B',
  city: 'Springfield',
  state: 'Oregon',
  postalCode: '97477',
  country: 'United States',
  paymentMethod: 'TEST_CARD',
});

const applyCoupon = async () => {
  if (!couponInput.value) return;
  const ok = await cart.applyCoupon(couponInput.value);
  if (ok) couponInput.value = '';
};

const handleCheckout = async () => {
  if (cart.items.length === 0) {
    toast.error('Cart is empty');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      shippingAddress: {
        fullName: form.customerName,
        phone: form.customerPhone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      },
      paymentMethod: form.paymentMethod,
      couponCode: cart.appliedCoupon?.code || null,
      items: cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    const res = await api.post('/api/orders/checkout', payload);
    const order = res.data;

    toast.success('Order placed successfully!');
    cart.clearCart();
    router.push(`/order-success/${order.orderNumber}`);
  } catch (err) {
    toast.error(err.message || 'Checkout failed');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  cart.fetchCart();
});
</script>

<style scoped>
.checkout-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.4rem;
  margin-bottom: 0.35rem;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1rem;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 2.5rem;
  align-items: flex-start;
}

.checkout-forms {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding: 2rem;
  background: var(--bg-surface);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  cursor: pointer;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  transition: all 0.2s ease;
}

.payment-option input {
  margin-top: 0.25rem;
}

.payment-option.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.08);
  box-shadow: 0 0 14px var(--primary-glow);
}

.pay-title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.25rem;
}

.payment-desc p {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.summary-card {
  padding: 2rem;
  background: var(--bg-surface);
  position: sticky;
  top: 5.5rem;
}

.summary-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
}

.checkout-items {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 260px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.checkout-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-thumb {
  width: 46px;
  height: 46px;
  object-fit: cover;
  border-radius: 0.4rem;
  background: #090e1a;
}

.item-info {
  flex-grow: 1;
}

.item-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-qty {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.item-price {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
}

.coupon-section {
  padding: 1rem 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.25rem;
}

.coupon-row {
  display: flex;
  gap: 0.5rem;
}

.coupon-field {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.applied-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 0.4rem;
  font-size: 0.82rem;
  color: #c7d2fe;
}

.btn-remove {
  color: var(--text-muted);
  font-weight: bold;
}

.totals-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
}

.discount-row {
  color: #6ee7b7;
}

.grand-total-row {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
}

.grand-total {
  color: #ffffff;
}

.submit-order-btn {
  padding: 1rem;
}

.security-note {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.empty-checkout {
  padding: 4rem 2rem;
  text-align: center;
}

.w-full {
  width: 100%;
}

@media (max-width: 992px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}
</style>
