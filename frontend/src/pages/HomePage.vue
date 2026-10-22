<template>
  <div class="homepage">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>Artisan Grooming & Botanical Skincare</span>
          </div>
          <h1 class="hero-title">
            Soothe. Refresh. <br />
            <span class="gradient-text">Recharge Your Skin.</span>
          </h1>
          <p class="hero-subtitle">
            Experience skin-friendly lavender extract infused with organic aloe vera. Calm razor burn, hydrate deeply, and maintain all-day botanical freshness with our 50 mL spray lotion.
          </p>
          <div class="hero-actions">
            <router-link to="/product/aftershave-lotion-lavender" class="btn btn-primary btn-lg">
              Shop Aftershave Lotion
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </router-link>
            <router-link to="/offers" class="btn btn-secondary btn-lg">
              View Special Offers
            </router-link>
          </div>

          <!-- Trust Badges -->
          <div class="trust-row">
            <div class="trust-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <span>Complimentary 2-Day Air</span>
            </div>
            <div class="trust-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>100% Aloe Vera Goodness</span>
            </div>
            <div class="trust-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
              <span>30-Day Money Back</span>
            </div>
          </div>
        </div>

        <!-- Hero Featured Visual Card -->
        <div class="hero-visual">
          <div class="visual-glow pulse-glow"></div>
          <div class="hero-card-preview card">
            <img
              src="/uploads/aftershave-lotion-pedestal.png"
              alt="Aftershave Lotion – Lavender on Marble Pedestal"
              class="hero-img"
            />
            <div class="hero-card-meta">
              <span class="badge badge-primary">Soothe • Refresh • Recharge</span>
              <h3>Aftershave Lotion – Lavender</h3>
              <div class="card-price-row">
                <span class="price">₹200</span>
                <span class="reg-price">₹250</span>
                <router-link to="/product/aftershave-lotion-lavender" class="btn btn-sm btn-primary">
                  Order Now
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Showcase -->
    <section class="categories-section section-padding">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Curated Collections</h2>
            <p class="section-subtitle">Botanical post-shave formulas and refined grooming essentials.</p>
          </div>
          <router-link to="/shop" class="btn btn-outline btn-sm">
            View All Collections &rarr;
          </router-link>
        </div>

        <div class="categories-grid">
          <router-link
            v-for="cat in homeData.categories"
            :key="cat.id"
            :to="`/shop?category=${cat.slug}`"
            class="category-card"
          >
            <div class="cat-image-wrapper">
              <img :src="cat.image" :alt="cat.name" class="cat-img" />
              <div class="cat-overlay"></div>
            </div>
            <div class="cat-content">
              <span class="cat-count">{{ cat._count?.products || 1 }} Product</span>
              <h3 class="cat-name">{{ cat.name }}</h3>
              <p class="cat-desc">{{ cat.description }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="section-padding">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="badge badge-primary">Botanical Care</span>
            <h2 class="section-title">Featured Highlights</h2>
          </div>
          <router-link to="/shop" class="btn btn-outline btn-sm">Browse Catalog &rarr;</router-link>
        </div>

        <div v-if="loading" class="loading-grid grid-4">
          <div v-for="n in 4" :key="n" class="skeleton-card card"></div>
        </div>

        <div v-else class="grid-4">
          <ProductCard
            v-for="product in homeData.featured"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- Limited-Time Flash Offer Banner -->
    <section class="promo-banner-section">
      <div class="container">
        <div class="promo-banner card">
          <div class="promo-content">
            <span class="badge badge-discount">Exclusive Flash Event</span>
            <h2 class="promo-title">Save 20% on Botanical Lavender Aftershave</h2>
            <p class="promo-desc">
              Upgrade your post-shave ritual with pure aloe vera goodness and calming French lavender. Apply coupon code <strong class="code-pill">WELCOME10</strong> at checkout for an extra 10% discount.
            </p>
            <div class="countdown-row">
              <div class="countdown-box">
                <span class="count-num">{{ countdown.hours }}</span>
                <span class="count-label">Hours</span>
              </div>
              <span class="colon">:</span>
              <div class="countdown-box">
                <span class="count-num">{{ countdown.minutes }}</span>
                <span class="count-label">Minutes</span>
              </div>
              <span class="colon">:</span>
              <div class="countdown-box">
                <span class="count-num">{{ countdown.seconds }}</span>
                <span class="count-label">Seconds</span>
              </div>
            </div>
            <router-link to="/product/aftershave-lotion-lavender" class="btn btn-primary btn-lg">
              Claim Flash Deal
            </router-link>
          </div>
          <div class="promo-visual">
            <img
              src="/uploads/aftershave-lotion-features-collage.jpg"
              alt="Aftershave Lotion Lavender Features & Benefits Collage"
              class="promo-img"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Best Sellers Section -->
    <section class="section-padding">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="badge badge-warning">Customer Favorites</span>
            <h2 class="section-title">Best-Selling Gear</h2>
          </div>
          <router-link to="/shop" class="btn btn-outline btn-sm">Shop All &rarr;</router-link>
        </div>

        <div class="grid-4">
          <ProductCard
            v-for="product in homeData.bestSellers"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- Trending Products Section -->
    <section class="section-padding bg-subtle">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="badge badge-success">Trending This Week</span>
            <h2 class="section-title">Trending Tech & Wearables</h2>
          </div>
          <router-link to="/shop" class="btn btn-outline btn-sm">Explore Trending &rarr;</router-link>
        </div>

        <div class="grid-4">
          <ProductCard
            v-for="product in homeData.trending"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- Customer Reviews & Testimonials -->
    <section class="section-padding">
      <div class="container">
        <div class="section-header center-header">
          <span class="badge badge-primary">Verified Customer Reviews</span>
          <h2 class="section-title">Trusted by Modern Gentlemen Worldwide</h2>
        </div>

        <div class="grid-3">
          <div class="testimonial-card card">
            <div class="stars">★★★★★</div>
            <p class="test-quote">
              "The cooling sensation is instantaneous. The natural lavender scent is subtle and masculine, and the aloe vera completely eliminated neck redness after shaving."
            </p>
            <div class="reviewer-meta">
              <div class="rev-avatar">AM</div>
              <div>
                <h4 class="rev-name">Alex Morgan</h4>
                <span class="rev-role">Verified Buyer</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card card">
            <div class="stars">★★★★★</div>
            <p class="test-quote">
              "Gentle on sensitive skin. Zero stinging or alcohol burning, just deep soothing hydration. The 50 mL spray bottle is sleek and easy to pack."
            </p>
            <div class="reviewer-meta">
              <div class="rev-avatar">MV</div>
              <div>
                <h4 class="rev-name">Dr. Marcus Vance</h4>
                <span class="rev-role">Dermatology Advocate</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card card">
            <div class="stars">★★★★★</div>
            <p class="test-quote">
              "Super fast 2-day delivery and immaculate packaging. The fine mist nozzle disperses the lotion perfectly without sticky residue. Truly a daily essential."
            </p>
            <div class="reviewer-meta">
              <div class="rev-avatar">JB</div>
              <div>
                <h4 class="rev-name">Jordan Blake</h4>
                <span class="rev-role">Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion Section -->
    <section class="section-padding bg-subtle">
      <div class="container faq-container">
        <div class="section-header center-header">
          <span class="badge badge-primary">Frequently Asked Questions</span>
          <h2 class="section-title">Everything You Need to Know</h2>
        </div>

        <div class="faq-list">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="faq-item card"
            :class="{ open: activeFaq === idx }"
            @click="activeFaq = activeFaq === idx ? -1 : idx"
          >
            <div class="faq-question">
              <h4>{{ faq.question }}</h4>
              <span class="faq-icon">{{ activeFaq === idx ? '−' : '+' }}</span>
            </div>
            <div v-show="activeFaq === idx" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Subscription Section -->
    <section class="newsletter-section section-padding">
      <div class="container">
        <div class="newsletter-box card">
          <div class="news-text">
            <span class="badge badge-primary">NovaMarket Insider</span>
            <h2 class="news-title">Join The Gentleman's Grooming Circle</h2>
            <p class="news-desc">
              Subscribe to receive curated grooming rituals, seasonal botanical drops, and an instant <strong>10% welcome coupon (WELCOME10)</strong>.
            </p>
          </div>

          <form @submit.prevent="handleNewsletter" class="news-form">
            <div class="news-input-row">
              <input
                v-model="newsletterEmail"
                type="email"
                class="input-field news-input"
                placeholder="Enter your email address"
                required
              />
              <button type="submit" class="btn btn-primary" :disabled="subscribing">
                {{ subscribing ? 'Subscribing...' : 'Subscribe Free' }}
              </button>
            </div>
            <label class="consent-label">
              <input v-model="newsletterConsent" type="checkbox" required />
              <span>I consent to receive product releases and promotional communications in accordance with the Privacy Policy.</span>
            </label>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '../services/api.js';
import { useToastStore } from '../stores/toast.js';
import ProductCard from '../components/ProductCard.vue';

const toast = useToastStore();

const loading = ref(true);
const homeData = ref({
  featured: [],
  bestSellers: [],
  newArrivals: [],
  trending: [],
  categories: [],
});

const countdown = ref({
  hours: '08',
  minutes: '42',
  seconds: '19',
});

let timerInterval = null;

const activeFaq = ref(0);
const faqs = [
  {
    question: 'Is Aftershave Lotion – Lavender suitable for sensitive skin?',
    answer: 'Yes! Our formula is 100% alcohol-free and enriched with pure organic Aloe Vera extract and soothing natural lavender essential oil. It calms razor irritation without burning or stinging.',
  },
  {
    question: 'How do I apply the 50 mL spray lotion?',
    answer: 'After shaving, rinse your face with cool water and pat dry. Spray 2-3 pumps into the palm of your hand and gently massage over the shaved neck and face, or mist lightly directly onto skin.',
  },
  {
    question: 'How does complimentary express shipping work?',
    answer: 'Orders over ₹499 receive free expedited air shipping. Orders placed before 3 PM are dispatched same-day with tracking details provided immediately.',
  },
  {
    question: 'What is your 30-day money-back guarantee?',
    answer: 'We offer an unconditional 30-day return policy. If you are not completely satisfied with your skin comfort and freshness, return it for a 100% refund.',
  },
];

const newsletterEmail = ref('');
const newsletterConsent = ref(true);
const subscribing = ref(false);

const handleNewsletter = async () => {
  if (!newsletterEmail.value) return;
  subscribing.value = true;
  try {
    const res = await api.post('/api/marketing/newsletter', {
      email: newsletterEmail.value,
      consentGiven: newsletterConsent.value,
    });
    toast.success(res.message || 'Subscribed successfully!');
    newsletterEmail.value = '';
  } catch (err) {
    toast.error(err.message || 'Failed to subscribe');
  } finally {
    subscribing.value = false;
  }
};

const fetchHomeData = async () => {
  try {
    const res = await api.get('/api/products/home-sections');
    homeData.value = res.data;
  } catch (err) {
    console.error('Failed to load homepage:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHomeData();

  // Countdown timer simulation
  let totalSecs = 8 * 3600 + 42 * 60 + 19;
  timerInterval = setInterval(() => {
    if (totalSecs > 0) {
      totalSecs--;
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      countdown.value = {
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
      };
    }
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
/* Hero Styles */
.hero-section {
  position: relative;
  padding: 5.5rem 0 4.5rem;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
  overflow: hidden;
}

.hero-container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 3.5rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #c7d2fe;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-cyan);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-cyan);
}

.hero-title {
  font-size: 3.4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.25rem;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.trust-row {
  display: flex;
  gap: 1.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.hero-visual {
  position: relative;
}

.visual-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 2rem;
  z-index: 1;
}

.hero-card-preview {
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-color: var(--border-medium);
}

.hero-img {
  width: 100%;
  height: 380px;
  object-fit: contain;
  background: radial-gradient(circle at center, rgba(30, 27, 75, 0.45) 0%, rgba(9, 14, 26, 0.98) 100%);
  padding: 1rem;
}

.hero-card-meta {
  padding: 1.5rem;
  background: var(--bg-surface);
}

.hero-card-meta h3 {
  font-size: 1.25rem;
  margin: 0.5rem 0 1rem;
}

.card-price-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
}

.reg-price {
  font-size: 0.95rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

.card-price-row .btn {
  margin-left: auto;
}

/* Categories Section */
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.center-header {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 2.2rem;
  margin-top: 0.35rem;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.category-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  border: 1px solid var(--border-subtle);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

.cat-image-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.cat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.category-card:hover .cat-img {
  transform: scale(1.08);
}

.cat-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%);
}

.cat-content {
  position: relative;
  z-index: 2;
}

.cat-count {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-cyan);
  font-weight: 700;
}

.cat-name {
  font-size: 1.25rem;
  margin: 0.2rem 0 0.4rem;
}

.cat-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Promo Banner */
.promo-banner {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  align-items: center;
  background: linear-gradient(135deg, #131d36 0%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  overflow: hidden;
}

.promo-content {
  padding: 3.5rem;
}

.promo-title {
  font-size: 2.2rem;
  margin: 0.75rem 0 1rem;
}

.promo-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.code-pill {
  padding: 0.2rem 0.5rem;
  background: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  border-radius: 4px;
}

.countdown-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.countdown-box {
  background: #090e1a;
  border: 1px solid var(--border-medium);
  border-radius: 0.75rem;
  padding: 0.6rem 1rem;
  text-align: center;
  min-width: 65px;
}

.count-num {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  display: block;
}

.count-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.colon {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-muted);
}

.promo-visual {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(10, 14, 26, 0.4);
}

.promo-img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

/* Testimonials */
.testimonial-card {
  padding: 2rem;
  background: var(--bg-surface);
}

.test-quote {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 1rem 0 1.5rem;
  font-style: italic;
}

.reviewer-meta {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.rev-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.rev-name {
  font-size: 0.95rem;
  color: var(--text-main);
}

.rev-role {
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* FAQ Accordion */
.faq-container {
  max-width: 800px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question h4 {
  font-size: 1.05rem;
  font-weight: 600;
}

.faq-icon {
  font-size: 1.35rem;
  font-weight: bold;
  color: var(--primary);
}

.faq-answer {
  padding-top: 1rem;
  color: var(--text-secondary);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* Newsletter */
.newsletter-box {
  padding: 3.5rem;
  background: radial-gradient(circle at 10% 50%, rgba(99, 102, 241, 0.2) 0%, #0f172a 100%);
  border: 1px solid var(--border-medium);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 3rem;
}

.news-title {
  font-size: 2rem;
  margin: 0.6rem 0 0.85rem;
}

.news-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.news-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.news-input-row {
  display: flex;
  gap: 0.5rem;
}

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  cursor: pointer;
}

.consent-label input {
  margin-top: 0.2rem;
}

.bg-subtle {
  background: #0b0f19;
}

@media (max-width: 992px) {
  .hero-container,
  .promo-banner,
  .newsletter-box {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 2.6rem;
  }
  .promo-visual {
    height: 300px;
  }
}
</style>
