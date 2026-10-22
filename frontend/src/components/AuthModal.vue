<template>
  <div v-if="auth.authModalOpen" class="modal-overlay" @click.self="auth.closeAuthModal">
    <div class="modal-content auth-modal">
      <div class="auth-header">
        <div class="brand-row">
          <div class="brand-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <span class="brand-name">NovaMarket Account</span>
        </div>
        <button class="close-btn" @click="auth.closeAuthModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="auth-tabs">
        <button
          :class="['tab-btn', { active: auth.authModalMode === 'login' }]"
          @click="auth.authModalMode = 'login'"
        >
          Sign In
        </button>
        <button
          :class="['tab-btn', { active: auth.authModalMode === 'register' }]"
          @click="auth.authModalMode = 'register'"
        >
          Create Account
        </button>
      </div>

      <!-- Quick Demo Credentials Fill -->
      <div v-if="auth.authModalMode === 'login'" class="demo-fill-box">
        <span class="demo-label">Quick Demo Access:</span>
        <div class="demo-actions">
          <button type="button" class="btn-demo" @click="fillAdminDemo">
            ⚡ Demo Admin
          </button>
          <button type="button" class="btn-demo" @click="fillCustomerDemo">
            👤 Demo Customer
          </button>
        </div>
      </div>

      <!-- Login Form -->
      <form v-if="auth.authModalMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label class="input-label">Email Address</label>
          <input
            v-model="loginEmail"
            type="email"
            class="input-field"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label">Password</label>
          <input
            v-model="loginPassword"
            type="password"
            class="input-field"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="auth.loading">
          <span v-if="auth.loading">Signing in...</span>
          <span v-else>Sign In to Account</span>
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="grid-2">
          <div class="input-group">
            <label class="input-label">First Name</label>
            <input
              v-model="regForm.firstName"
              type="text"
              class="input-field"
              placeholder="Alex"
              required
            />
          </div>
          <div class="input-group">
            <label class="input-label">Last Name</label>
            <input
              v-model="regForm.lastName"
              type="text"
              class="input-field"
              placeholder="Morgan"
              required
            />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Email Address</label>
          <input
            v-model="regForm.email"
            type="email"
            class="input-field"
            placeholder="alex@example.com"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label">Phone Number (Optional)</label>
          <input
            v-model="regForm.phone"
            type="tel"
            class="input-field"
            placeholder="+1 555-0199"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Password</label>
          <input
            v-model="regForm.password"
            type="password"
            class="input-field"
            placeholder="At least 6 characters"
            minlength="6"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="auth.loading">
          <span v-if="auth.loading">Creating Account...</span>
          <span v-else>Create Free Account</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();

const loginEmail = ref('');
const loginPassword = ref('');

const regForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
});

const fillAdminDemo = () => {
  loginEmail.value = 'admin@novamarket.com';
  loginPassword.value = 'Admin@12345';
};

const fillCustomerDemo = () => {
  loginEmail.value = 'customer@novamarket.com';
  loginPassword.value = 'Customer@12345';
};

const handleLogin = async () => {
  await auth.login(loginEmail.value, loginPassword.value);
};

const handleRegister = async () => {
  await auth.register(regForm);
};
</script>

<style scoped>
.auth-modal {
  padding: 2rem;
  background: #0f172a;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary) 0%, hsl(245, 82%, 48%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.15rem;
}

.close-btn {
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-main);
}

.auth-tabs {
  display: flex;
  background: var(--bg-surface-elevated);
  padding: 0.35rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-subtle);
}

.tab-btn {
  flex: 1;
  padding: 0.65rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.demo-fill-box {
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
}

.demo-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a5b4fc;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.demo-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-demo {
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.btn-demo:hover {
  background: rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.w-full {
  width: 100%;
}
</style>
