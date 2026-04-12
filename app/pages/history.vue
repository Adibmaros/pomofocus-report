<template>
  <div class="history-page" id="history-page">
    <div class="container">
      <div class="page-header animate-fade-in-up">
        <div>
          <h1 class="page-title">Report <span class="text-gradient">History</span></h1>
          <p class="page-subtitle">All your generated productivity reports</p>
        </div>
        <NuxtLink to="/report/new" class="btn btn-primary">📤 New Report</NuxtLink>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
        <p>Loading reports...</p>
      </div>

      <div v-else-if="reports.length === 0" class="empty-state card animate-fade-in-up">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">No reports yet</h3>
        <p class="empty-state-desc">Create your first report to see it here</p>
        <NuxtLink to="/report/new" class="btn btn-primary">Create Report</NuxtLink>
      </div>

      <div v-else class="table-container card animate-fade-in-up">
        <table class="table" id="history-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Period</th>
              <th>Total Time</th>
              <th>Active Days</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>
                <NuxtLink :to="`/report/${report.id}`" class="report-link">
                  📄 {{ report.filename }}
                </NuxtLink>
              </td>
              <td class="text-secondary">
                {{ formatDate(report.periodStart) }} — {{ formatDate(report.periodEnd) }}
              </td>
              <td>
                <span class="font-mono">{{ formatMinutes(report.totalMinutes) }}</span>
              </td>
              <td>{{ report.activeDays }} days</td>
              <td class="text-secondary">{{ formatDate(report.createdAt) }}</td>
              <td>
                <div style="display: flex; gap: var(--space-sm)">
                  <NuxtLink :to="`/report/${report.id}`" class="btn btn-ghost btn-sm">View</NuxtLink>
                  <button
                    class="btn btn-ghost btn-sm"
                    style="color: var(--error)"
                    @click="handleDelete(report.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'History — FocusReport',
})

const reports = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch('/api/reports')
    reports.value = data.reports || []
  } catch (err) {
    console.error('Failed to load reports:', err)
  } finally {
    loading.value = false
  }
})

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this report?')) return

  try {
    await $fetch(`/api/reports/${id}`, { method: 'DELETE' })
    reports.value = reports.value.filter((r) => r.id !== id)
  } catch (err) {
    console.error('Failed to delete:', err)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}
</script>

<style scoped>
.history-page {
  padding: var(--space-2xl) 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-3xl);
  color: var(--text-secondary);
}

.report-link {
  font-weight: 600;
  color: var(--text-primary);
}

.report-link:hover {
  color: var(--accent-light);
}

.font-mono {
  font-family: var(--font-mono);
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-md);
  }
}
</style>
