<template>
  <div class="app-layout">
    <header class="navbar" id="main-navbar">
      <div class="navbar-inner container">
        <NuxtLink to="/" class="navbar-brand" id="navbar-brand">
          <span class="navbar-logo">📊</span>
          <span class="navbar-title">Focus<span class="text-gradient">Report</span></span>
        </NuxtLink>

        <nav class="navbar-nav" id="main-nav">
          <template v-if="loggedIn">
            <NuxtLink to="/dashboard" class="nav-link" id="nav-dashboard">Dashboard</NuxtLink>
            <NuxtLink to="/report/new" class="nav-link" id="nav-new-report">New Report</NuxtLink>
            <NuxtLink to="/history" class="nav-link" id="nav-history">History</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/pricing" class="nav-link" id="nav-pricing">Pricing</NuxtLink>
          </template>
        </nav>

        <div class="navbar-actions">
          <template v-if="loggedIn">
            <div class="user-menu" id="user-menu" @click="showMenu = !showMenu">
              <div class="user-avatar">
                {{ user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <span class="user-name">{{ user?.name || user?.email?.split('@')[0] }}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>

              <div v-if="showMenu" class="user-dropdown" id="user-dropdown">
                <NuxtLink to="/settings" class="dropdown-item" id="dropdown-settings">
                  ⚙️ Settings
                </NuxtLink>
                <button class="dropdown-item dropdown-danger" id="dropdown-logout" @click.stop="handleLogout">
                  🚪 Logout
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="btn btn-ghost btn-sm" id="nav-login">Login</NuxtLink>
            <NuxtLink to="/auth/register" class="btn btn-primary btn-sm" id="nav-register">Get Started</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <footer class="footer" id="main-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="navbar-logo">📊</span>
          <span>Focus<span class="text-gradient">Report</span></span>
        </div>
        <p class="footer-text">© {{ new Date().getFullYear() }} FocusReport. Open Source under AGPLv3.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const { loggedIn, user, clear } = useUserSession()
const showMenu = ref(false)

async function handleLogout() {
  await clear()
  showMenu.value = false
  navigateTo('/')
}

// Close menu on click outside
if (import.meta.client) {
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('user-menu')
    if (menu && !menu.contains(e.target)) {
      showMenu.value = false
    }
  })
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: var(--nav-height);
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
}

.navbar-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  text-decoration: none;
}

.navbar-logo {
  font-size: 1.4rem;
}

.navbar-title {
  letter-spacing: -0.02em;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.nav-link {
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.router-link-active {
  color: var(--accent-light);
  background: var(--accent-glow);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* User Menu */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
  color: var(--text-secondary);
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-xs);
  box-shadow: var(--shadow-lg);
  animation: fadeIn 0.15s ease;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.dropdown-danger:hover {
  color: var(--error);
  background: var(--error-bg);
}

/* Footer */
.footer {
  border-top: 1px solid var(--border-color);
  padding: var(--space-xl) 0;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 700;
  font-size: 1rem;
}

.footer-text {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .navbar-nav {
    display: none;
  }

  .user-name {
    display: none;
  }

  .footer-inner {
    flex-direction: column;
    gap: var(--space-sm);
    text-align: center;
  }
}
</style>
