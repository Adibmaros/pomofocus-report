<template>
  <div class="auth-page" id="register-page">
    <div class="auth-card card animate-fade-in-up">
      <div class="auth-card-header">
        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start generating productivity reports for free</p>
      </div>

      <div v-if="errorMessage" class="auth-error" id="register-error">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="auth-form" id="register-form">
        <div class="form-group">
          <label class="form-label" for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            minlength="8"
            required
          />
          <span class="form-hint">Minimum 8 characters</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
          id="register-submit"
          style="width: 100%"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <div class="divider">or continue with</div>

      <a
        href="/api/auth/google"
        class="btn btn-secondary"
        id="register-google"
        style="width: 100%"
        rel="external"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        Google
      </a>

      <p class="auth-link">
        Already have an account?
        <NuxtLink to="/auth/login">Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Register — FocusReport',
})

const { fetch: refreshSession } = useUserSession()

const form = ref({
  name: '',
  email: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form.value,
    })

    await refreshSession()
    navigateTo('/dashboard')
  } catch (err) {
    errorMessage.value = err.data?.statusMessage || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  padding: var(--space-2xl);
  background: rgba(22, 22, 31, 0.8);
  backdrop-filter: blur(20px);
}

.auth-card-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: var(--space-xs);
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-error {
  background: var(--error-bg);
  color: var(--error);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: var(--space-lg);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.auth-link {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: var(--space-lg);
}

.auth-link a {
  color: var(--accent-light);
  font-weight: 600;
}
</style>
