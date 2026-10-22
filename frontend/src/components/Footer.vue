<template>
  <footer class="footer-wrapper">
    <div class="container footer-content">
      <!-- Col 1: Brand Info -->
      <div class="footer-col brand-col">
        <div class="brand-row">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <span class="logo-title">Nova<span class="accent-dot">Market</span></span>
        </div>
        <p class="brand-desc">
          Formulating artisan post-shave botanical lotions, soothing aloe vera skincare, and skin-friendly daily essentials to soothe, refresh, and recharge.
        </p>
        <div class="social-links">
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
        </div>
      </div>

      <!-- Col 2: Navigation Links -->
      <div class="footer-col">
        <h4 class="col-title">Explore Store</h4>
        <ul class="footer-links">
          <li><router-link to="/shop">All Collections</router-link></li>
          <li><router-link to="/product/aftershave-lotion-lavender">Aftershave Lotion – Lavender</router-link></li>
          <li><router-link to="/shop?category=mens-grooming">Men's Grooming</router-link></li>
          <li><router-link to="/offers">Flash Deals & Coupons</router-link></li>
        </ul>
      </div>

      <!-- Col 3: Customer Support & Policies -->
      <div class="footer-col">
        <h4 class="col-title">Customer Care</h4>
        <ul class="footer-links">
          <li><router-link to="/track">Track Your Package</router-link></li>
          <li><router-link to="/about">Shipping Policy (Complimentary >$100)</router-link></li>
          <li><router-link to="/about">30-Day Hassle-Free Returns</router-link></li>
          <li><router-link to="/about">Warranty & Authenticity Guarantee</router-link></li>
          <li><router-link to="/contact">FAQ & Live Support</router-link></li>
        </ul>
      </div>

      <!-- Col 4: Contact & Inquiries -->
      <div class="footer-col">
        <h4 class="col-title">Direct Inquiries</h4>
        <p class="contact-line">
          <strong>Email:</strong> support@novamarket.store
        </p>
        <p class="contact-line">
          <strong>Concierge:</strong> +1 (800) 555-NOVA
        </p>
        <p class="contact-line">
          <strong>WhatsApp:</strong> Available 24/7 Priority Support
        </p>
        <div class="payment-badges">
          <span class="pay-pill">Razorpay Verified</span>
          <span class="pay-pill">SSL 256-Bit</span>
          <span class="pay-pill">COD Available</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div class="container bottom-content">
        <p>&copy; 2026 NovaMarket Technologies Inc. All rights reserved.</p>
        <div class="legal-links">
          <router-link to="/about">Privacy Policy</router-link>
          <span>&bull;</span>
          <router-link to="/about">Terms of Service</router-link>
          <span>&bull;</span>
          <a href="/sitemap.xml" target="_blank">XML Sitemap</a>
          <span>&bull;</span>
          <a href="/robots.txt" target="_blank">robots.txt</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-wrapper {
  background: #080c14;
  border-top: 1px solid var(--border-subtle);
  padding-top: 4.5rem;
  margin-top: 5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1.4fr;
  gap: 3rem;
  padding-bottom: 3.5rem;
}

.brand-col {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
}

.accent-dot {
  color: var(--primary);
}

.brand-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-links a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.social-links a:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.col-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--text-main);
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.15s ease;
}

.footer-links a:hover {
  color: var(--primary);
}

.contact-line {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 0.6rem;
}

.contact-line strong {
  color: var(--text-main);
}

.payment-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pay-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 9999px;
  color: #a5b4fc;
}

.footer-bottom {
  border-top: 1px solid var(--border-subtle);
  padding: 1.5rem 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legal-links {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.legal-links a:hover {
  color: var(--text-main);
}

@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  .bottom-content {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
}
</style>
