<template>
  <div class="contact-page section-padding">
    <div class="container">
      <div class="contact-header text-center">
        <span class="badge badge-primary">Customer Care Concierge</span>
        <h1 class="page-title">We Are Here to Assist You</h1>
        <p class="page-desc">Have a technical hardware question, order query, or corporate requisition? Reach our specialists below.</p>
      </div>

      <div class="contact-layout">
        <!-- Left: Inquiry Form -->
        <div class="contact-form-card card">
          <h3>Send Us a Direct Message</h3>
          <form @submit.prevent="handleSubmit" class="contact-form">
            <div class="grid-2">
              <div class="input-group">
                <label class="input-label">Your Name *</label>
                <input v-model="form.name" type="text" class="input-field" placeholder="Alex Morgan" required />
              </div>
              <div class="input-group">
                <label class="input-label">Email Address *</label>
                <input v-model="form.email" type="email" class="input-field" placeholder="alex@example.com" required />
              </div>
            </div>

            <div class="grid-2">
              <div class="input-group">
                <label class="input-label">Phone Number (Optional)</label>
                <input v-model="form.phone" type="tel" class="input-field" placeholder="+1 555-0199" />
              </div>
              <div class="input-group">
                <label class="input-label">Subject</label>
                <input v-model="form.subject" type="text" class="input-field" placeholder="Order / Product Inquiry" />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Message *</label>
              <textarea v-model="form.message" class="input-field" rows="5" placeholder="How can our concierge team assist you?" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
              {{ submitting ? 'Sending Inquiry...' : 'Submit Inquiry' }}
            </button>
          </form>
        </div>

        <!-- Right: Direct Channels -->
        <div class="contact-info-col">
          <div class="info-card card">
            <h3>Immediate Direct Channels</h3>

            <div class="info-item">
              <div class="info-icon">💬</div>
              <div>
                <strong>WhatsApp Concierge (24/7)</strong>
                <p>Instant chat with an audio specialist regarding product recommendations or order status.</p>
                <a
                  href="https://wa.me/18005550199?text=Hello%20NovaMarket%20Support"
                  target="_blank"
                  rel="noopener"
                  class="btn-wa"
                >
                  Open WhatsApp Chat &rarr;
                </a>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">✉️</div>
              <div>
                <strong>Email Support</strong>
                <p>support@novamarket.store</p>
                <small>Average response time: &lt; 2 hours</small>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">📞</div>
              <div>
                <strong>Toll-Free Phone Concierge</strong>
                <p>+1 (800) 555-NOVA</p>
                <small>Mon - Sat: 9 AM to 8 PM EST</small>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">📍</div>
              <div>
                <strong>Headquarters & Studio Showroom</strong>
                <p>742 Evergreen Audio Plaza, Suite 400<br />Springfield, OR 97477, USA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { api } from '../services/api.js';
import { useToastStore } from '../stores/toast.js';

const toast = useToastStore();
const submitting = ref(false);

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
});

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/marketing/contact', form);
    toast.success(res.message || 'Inquiry submitted successfully! We will contact you shortly.');
    form.name = '';
    form.email = '';
    form.phone = '';
    form.subject = '';
    form.message = '';
  } catch (err) {
    toast.error(err.message || 'Failed to submit inquiry');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.text-center {
  text-align: center;
}

.contact-header {
  margin-bottom: 3.5rem;
}

.page-title {
  font-size: 2.6rem;
  margin: 0.5rem 0;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto;
}

.contact-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2.5rem;
  align-items: flex-start;
}

.contact-form-card {
  padding: 2.5rem;
  background: var(--bg-surface);
}

.contact-form-card h3 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-card {
  padding: 2.5rem;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.info-card h3 {
  font-size: 1.4rem;
}

.info-item {
  display: flex;
  gap: 1rem;
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-item strong {
  display: block;
  font-size: 1rem;
  color: var(--text-main);
  margin-bottom: 0.2rem;
}

.info-item p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.info-item small {
  color: var(--text-muted);
  font-size: 0.78rem;
}

.btn-wa {
  display: inline-block;
  margin-top: 0.5rem;
  color: #25d366;
  font-weight: 700;
  font-size: 0.85rem;
}

@media (max-width: 992px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }
}
</style>
