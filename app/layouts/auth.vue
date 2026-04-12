<template>
  <div class="auth-layout">
    <div class="auth-bg">
      <div class="auth-blob auth-blob-1"></div>
      <div class="auth-blob auth-blob-2"></div>
      <div class="auth-blob auth-blob-3"></div>
    </div>

    <header class="auth-header">
      <NuxtLink to="/" class="navbar-brand">
        <span class="navbar-logo">📊</span>
        <span class="navbar-title">Focus<span class="text-gradient">Report</span></span>
      </NuxtLink>
    </header>

    <main class="auth-main">
      <slot />
    </main>

    <footer class="auth-footer">
      <p>© {{ new Date().getFullYear() }} FocusReport. Open Source under AGPLv3.</p>
    </footer>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.auth-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.08;
}

.auth-blob-1 {
  width: 600px;
  height: 600px;
  background: var(--accent);
  top: -200px;
  right: -200px;
  animation: float 12s ease-in-out infinite;
}

.auth-blob-2 {
  width: 400px;
  height: 400px;
  background: #c084fc;
  bottom: -100px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

.auth-blob-3 {
  width: 300px;
  height: 300px;
  background: #3b82f6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 10s ease-in-out infinite;
}

.auth-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: var(--space-lg);
  z-index: 10;
}

.navbar-brand {
  display: inline-flex;
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

.auth-main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: var(--space-xl);
}

.auth-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-lg);
  text-align: center;
  z-index: 10;
}

.auth-footer p {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
</style>
