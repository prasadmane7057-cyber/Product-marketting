<template>
  <div class="about-page section-padding">
    <div class="container about-container">
      <div class="about-hero text-center">
        <span class="badge badge-primary">Our Philosophy & Principles</span>
        <h1 class="page-title">Refining The Art of Modern Grooming</h1>
        <p class="page-desc">
          NovaMarket was founded on an uncompromising principle: that daily grooming rituals should calm, nourish, and protect your skin using nature's finest botanicals and pure aloe vera goodness.
        </p>
      </div>

      <!-- Core Value Pillars -->
      <div class="pillars-grid grid-3">
        <div class="pillar-card card">
          <div class="pillar-icon">🌿</div>
          <h3>Botanical & Aloe Vera Purity</h3>
          <p>We formulate with pure organic aloe vera extract and calming natural lavender essential oil. 100% alcohol-free to eliminate razor burn and soothe irritation immediately.</p>
        </div>
        <div class="pillar-card card">
          <div class="pillar-icon">🛡️</div>
          <h3>Skin-Friendly & Dermatologically Tested</h3>
          <p>Every bottle is crafted cruelty-free and vegan, without harsh parabens or synthetic colorants. Perfectly balanced for sensitive, oily, and dry skin types.</p>
        </div>
        <div class="pillar-card card">
          <div class="pillar-icon">✈️</div>
          <h3>Complimentary Express Air Transit</h3>
          <p>Our orders are packed in eco-friendly protective packaging and dispatched within 24 hours with fast express air delivery across all domestic routes.</p>
        </div>
      </div>

      <!-- Policies Overview -->
      <section class="policies-section card">
        <h2>Customer Policies & Guarantees</h2>

        <div class="policy-block">
          <h4>Complimentary Shipping Policy</h4>
          <p>Orders valued at $35 or above receive free priority express air shipping. Orders placed before 3 PM EST are processed on the same business day with end-to-end tracking.</p>
        </div>

        <div class="policy-block">
          <h4>30-Day No-Hassle Return & Refund Guarantee</h4>
          <p>We want you to be 100% delighted with your skin comfort. If you are not completely satisfied with your aftershave within 30 days of delivery, initiate a return for a full refund.</p>
        </div>

        <div class="policy-block">
          <h4>Privacy Policy & Data Security</h4>
          <p>We respect customer privacy. We strictly safeguard email communications, shipping information, and encrypted authentication tokens. We never sell customer records to third-party ad brokers.</p>
        </div>

        <div class="policy-block">
          <h4>Terms and Conditions of Sale</h4>
          <p>All product prices are stated in USD/INR inclusive of relevant manufacturing duties. Official invoices are generated electronically and archived within your customer dashboard.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 900px;
}

.about-hero {
  margin-bottom: 3.5rem;
}

.text-center {
  text-align: center;
}

.page-title {
  font-size: 2.6rem;
  margin: 0.6rem 0 1rem;
}

.page-desc {
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.pillars-grid {
  margin-bottom: 3.5rem;
}

.pillar-card {
  padding: 2rem;
  background: var(--bg-surface);
}

.pillar-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.pillar-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.6rem;
}

.pillar-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.policies-section {
  padding: 2.5rem;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.policies-section h2 {
  font-size: 1.8rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1rem;
}

.policy-block h4 {
  font-size: 1.1rem;
  color: #a5b4fc;
  margin-bottom: 0.4rem;
}

.policy-block p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
