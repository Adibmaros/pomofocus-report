<template>
  <div class="settings-page" id="settings-page">
    <div class="container container-sm">
      <div class="page-header animate-fade-in-up">
        <h1 class="page-title">
          <span class="text-gradient">Settings</span>
        </h1>
        <p class="page-subtitle">Manage your account and preferences</p>
      </div>

      <!-- Profile Section -->
      <div class="settings-section card animate-fade-in-up" style="animation-delay: 0.1s">
        <h3 class="section-title">👤 Profile</h3>

        <div v-if="successMessage" class="toast-inline toast-success">
          {{ successMessage }}
        </div>

        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-group">
            <label class="form-label" for="name">Name</label>
            <input
              id="name"
              v-model="profileForm.name"
              type="text"
              class="form-input"
              placeholder="Your name"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              :value="user?.email"
              type="email"
              class="form-input"
              disabled
              style="opacity: 0.6"
            />
            <span class="form-hint">Email cannot be changed</span>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="saving" id="save-profile">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <!-- Plan Section -->
      <div class="settings-section card animate-fade-in-up" style="animation-delay: 0.2s">
        <h3 class="section-title">💎 Subscription</h3>

        <div class="plan-info">
          <div>
            <span :class="['badge', user?.plan === 'PRO' ? 'badge-pro' : 'badge-accent']" style="font-size: 0.8rem">
              {{ user?.plan || 'FREE' }}
            </span>
            <p class="text-secondary" style="margin-top: var(--space-sm); font-size: 0.88rem">
              <template v-if="user?.plan === 'PRO'">
                Unlimited reports, AI in multiple languages, priority support
              </template>
              <template v-else>
                3 reports per month, basic features
              </template>
            </p>
          </div>
          <NuxtLink v-if="user?.plan !== 'PRO'" to="/pricing" class="btn btn-primary btn-sm">
            Upgrade to Pro
          </NuxtLink>
        </div>
      </div>

      <!-- Password Section -->
      <div class="settings-section card animate-fade-in-up" style="animation-delay: 0.3s">
        <h3 class="section-title">🔒 Change Password</h3>

        <div v-if="passwordError" class="toast-inline toast-error">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="toast-inline toast-success">
          {{ passwordSuccess }}
        </div>

        <form @submit.prevent="changePassword" class="settings-form">
          <div class="form-group">
            <label class="form-label" for="current-password">Current Password</label>
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              type="password"
              class="form-input"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="new-password">New Password</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              placeholder="••••••••"
              minlength="8"
            />
          </div>

          <button type="submit" class="btn btn-secondary" :disabled="changingPassword" id="change-password-btn">
            {{ changingPassword ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="settings-section card danger-zone animate-fade-in-up" style="animation-delay: 0.4s">
        <h3 class="section-title" style="color: var(--error)">⚠️ Danger Zone</h3>
        <p class="text-secondary" style="font-size: 0.88rem; margin-bottom: var(--space-lg)">
          Once you delete your account, there is no going back. All your reports will be permanently deleted.
        </p>
        <button class="btn btn-danger btn-sm" id="delete-account-btn">
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Settings — FocusReport',
})

const { user, fetch: refreshSession } = useUserSession()

const profileForm = ref({
  name: user.value?.name || '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
})

const saving = ref(false)
const successMessage = ref('')
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

async function updateProfile() {
  saving.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: { name: profileForm.value.name },
    })
    await refreshSession()
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Failed to update:', err)
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    await $fetch('/api/user/password', {
      method: 'PUT',
      body: passwordForm.value,
    })
    passwordSuccess.value = 'Password changed successfully!'
    passwordForm.value = { currentPassword: '', newPassword: '' }
    setTimeout(() => (passwordSuccess.value = ''), 3000)
  } catch (err) {
    passwordError.value = err.data?.statusMessage || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped>
.settings-page {
  padding: var(--space-2xl) 0;
}

.page-header {
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  color: var(--text-secondary);
}

.settings-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: var(--space-lg);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.plan-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.danger-zone {
  border-color: rgba(239, 68, 68, 0.15);
}

.toast-inline {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: var(--space-lg);
}

.toast-inline.toast-success {
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.15);
}

.toast-inline.toast-error {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.15);
}
</style>
