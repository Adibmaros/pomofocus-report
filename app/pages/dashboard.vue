<template>
  <div class="dashboard" id="dashboard-page">
    <div class="container">
      <div class="page-header animate-fade-in-up">
        <div>
          <h1 class="page-title">
            Welcome back, <span class="text-gradient">{{ user?.name?.split(' ')[0] || 'there' }}</span> 👋
          </h1>
          <p class="page-subtitle">Here's your productivity overview</p>
        </div>
        <NuxtLink to="/report/new" class="btn btn-primary" id="dashboard-new-report">
          📤 New Report
        </NuxtLink>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid stagger-children" id="dashboard-stats">
        <div class="stat-card">
          <span class="stat-label">Total Reports</span>
          <span class="stat-value">{{ stats.totalReports }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Focus Time</span>
          <span class="stat-value">
            {{ formatHours(stats.totalMinutes) }}
            <span class="stat-unit">hours</span>
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active Days Tracked</span>
          <span class="stat-value">{{ stats.totalActiveDays }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Plan</span>
          <span class="stat-value">
            <span :class="['badge', user?.plan === 'PRO' ? 'badge-pro' : 'badge-accent']">
              {{ user?.plan || 'FREE' }}
            </span>
          </span>
        </div>
      </div>

      <!-- Recent Reports -->
      <div class="section-header animate-fade-in-up" style="animation-delay: 0.3s">
        <h2>Recent Reports</h2>
        <NuxtLink v-if="reports.length > 0" to="/history" class="btn btn-ghost btn-sm">
          View All →
        </NuxtLink>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
        <p>Loading reports...</p>
      </div>

      <div v-else-if="reports.length === 0" class="empty-state card animate-fade-in-up">
        <div class="empty-state-icon">📊</div>
        <h3 class="empty-state-title">No reports yet</h3>
        <p class="empty-state-desc">Upload your first Pomofocus CSV to generate a report</p>
        <NuxtLink to="/report/new" class="btn btn-primary" id="empty-new-report">
          📤 Create Your First Report
        </NuxtLink>
      </div>

      <div v-else class="reports-grid stagger-children">
        <NuxtLink
          v-for="report in reports"
          :key="report.id"
          :to="`/report/${report.id}`"
          class="report-card card card-glow"
          :id="`report-${report.id}`"
        >
          <div class="report-card-header">
            <span class="report-filename">📄 {{ report.filename }}</span>
            <span class="report-date">{{ formatDate(report.createdAt) }}</span>
          </div>
          <div class="report-card-stats">
            <div class="report-stat">
              <span class="report-stat-value">{{ formatMinutes(report.totalMinutes) }}</span>
              <span class="report-stat-label">Total</span>
            </div>
            <div class="report-stat">
              <span class="report-stat-value">{{ report.activeDays }}</span>
              <span class="report-stat-label">Days</span>
            </div>
            <div class="report-stat">
              <span class="report-stat-value">{{ formatMinutes(Math.round(report.totalMinutes / report.activeDays)) }}</span>
              <span class="report-stat-label">Avg/Day</span>
            </div>
          </div>
          <div class="report-period">
            {{ formatDate(report.periodStart) }} — {{ formatDate(report.periodEnd) }}
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Dashboard — FocusReport',
})

const { user, fetch: refreshSession } = useUserSession()

const reports = ref([])
const loading = ref(true)
const stats = ref({
  totalReports: 0,
  totalMinutes: 0,
  totalActiveDays: 0,
})

onMounted(async () => {
  try {
    const data = await $fetch('/api/reports')
    reports.value = data.reports || []
    stats.value = data.stats || stats.value
    
    // Sync session if plan in DB is different from session (Cache fix)
    if (data.plan && data.plan !== user.value?.plan) {
      await $fetch('/api/auth/sync')
      await refreshSession()
    }
  } catch (err) {
    console.error('Failed to load reports:', err)
  } finally {
    loading.value = false
  }
})

function formatHours(minutes) {
  return (minutes / 60).toFixed(1)
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.dashboard {
  padding: var(--space-2xl) 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-3xl);
  color: var(--text-secondary);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-lg);
}

.report-card {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.report-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.report-filename {
  font-weight: 600;
  font-size: 0.9rem;
}

.report-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.report-card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.report-stat {
  text-align: center;
}

.report-stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-light);
}

.report-stat-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.report-period {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
