<template>
  <div class="report-detail" id="report-detail-page">
    <div class="container container-md">
      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
        <p>Loading report...</p>
      </div>

      <div v-else-if="error" class="empty-state card">
        <div class="empty-state-icon">❌</div>
        <h3 class="empty-state-title">Report not found</h3>
        <p class="empty-state-desc">{{ error }}</p>
        <NuxtLink to="/dashboard" class="btn btn-primary">Back to Dashboard</NuxtLink>
      </div>

      <template v-else-if="report">
        <!-- Header -->
        <div class="report-header animate-fade-in-up">
          <NuxtLink to="/dashboard" class="btn btn-ghost btn-sm">← Dashboard</NuxtLink>

          <div class="report-header-info">
            <h1 class="page-title">📄 {{ report.filename }}</h1>
            <p class="text-secondary">
              Generated {{ formatDate(report.createdAt) }} •
              {{ formatDateRange(report.periodStart, report.periodEnd) }}
            </p>
          </div>

          <div class="report-actions">
            <button class="btn btn-primary" @click="downloadPDF" id="download-pdf-btn">
              ⬇️ Download PDF
            </button>
            <button class="btn btn-danger btn-sm" @click="confirmDelete" id="delete-report-btn">
              🗑️ Delete
            </button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid stagger-children">
          <div class="stat-card">
            <span class="stat-label">Total Time</span>
            <span class="stat-value">{{ formatHoursFull(stats.totalMinutes) }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Active Days</span>
            <span class="stat-value">{{ stats.activeDays }}<span class="stat-unit">/ {{ stats.totalDaysInPeriod }} days</span></span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Daily Average</span>
            <span class="stat-value">{{ formatHoursFull(stats.avgPerDay) }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Consistency</span>
            <span class="stat-value">{{ Math.round((stats.activeDays / stats.totalDaysInPeriod) * 100) }}<span class="stat-unit">%</span></span>
          </div>
        </div>

        <!-- AI Insight -->
        <div class="insight-card card animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="insight-header">
            <h3>🤖 AI Insight</h3>
            <span class="badge badge-accent">Groq AI</span>
          </div>
          <div class="insight-content">
            <p v-for="(paragraph, i) in insightParagraphs" :key="i" class="insight-paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <!-- Daily Chart -->
        <div class="chart-card card animate-fade-in-up" style="animation-delay: 0.3s">
          <h3 style="margin-bottom: var(--space-lg)">📊 Daily Focus Distribution</h3>
          <div class="bar-chart" id="daily-chart">
            <div
              v-for="(day, i) in dailyData"
              :key="i"
              class="bar-row"
            >
              <span class="bar-label">{{ formatChartDateID(day.date) }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: (day.minutes / maxDaily * 100) + '%',
                    animationDelay: (i * 0.03) + 's'
                  }"
                ></div>
              </div>
              <span class="bar-value">{{ day.minutes }}m</span>
            </div>
          </div>
        </div>

        <!-- Project Distribution -->
        <div v-if="projectData.length > 1" class="chart-card card animate-fade-in-up" style="animation-delay: 0.35s">
          <h3 style="margin-bottom: var(--space-lg)">📂 Project Distribution</h3>
          <div class="project-list">
            <div v-for="(project, i) in projectData" :key="i" class="project-item">
              <div class="project-info">
                <div class="project-dot" :style="{ background: projectColors[i % projectColors.length] }"></div>
                <span class="project-name">{{ project.name }}</span>
              </div>
              <div class="project-bar-track">
                <div
                  class="project-bar-fill"
                  :style="{
                    width: (project.minutes / stats.totalMinutes * 100) + '%',
                    background: projectColors[i % projectColors.length],
                  }"
                ></div>
              </div>
              <span class="project-value">
                {{ formatHoursFull(project.minutes) }}
                <span class="project-pct">({{ Math.round(project.minutes / stats.totalMinutes * 100) }}%)</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Highlights -->
        <div class="highlights-grid stagger-children" style="animation-delay: 0.4s">
          <div class="highlight-card card">
            <span class="highlight-icon">🏆</span>
            <h4>Most Productive Day</h4>
            <p class="text-gradient" style="font-size: 1.25rem; font-weight: 700">
              {{ stats.longestDay ? formatChartDateID(stats.longestDay.date) : 'N/A' }}
            </p>
          </div>
          <div class="highlight-card card">
            <span class="highlight-icon">📉</span>
            <h4>Least Productive Day</h4>
            <p style="font-size: 1.25rem; font-weight: 700; color: var(--warning)">
              {{ formatHoursFull(stats.shortestDay?.minutes || 0) }}
            </p>
            <p class="text-secondary" style="font-size: 0.8rem">
              {{ stats.shortestDay ? formatChartDateID(stats.shortestDay.date) : 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Data Table -->
        <div class="table-section card animate-fade-in-up" style="animation-delay: 0.5s">
          <h3 style="margin-bottom: var(--space-lg)">📋 Detailed Data</h3>
          <div class="table-container" style="max-height: 500px; overflow-y: auto">
            <table class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Project</th>
                  <th>Minutes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in rawRows" :key="i">
                  <td style="color: var(--text-tertiary)">{{ i + 1 }}</td>
                  <td>{{ formatChartDateID(row.date) }}</td>
                  <td>{{ getDayName(row.date) }}</td>
                  <td>{{ row.project || '—' }}</td>
                  <td>
                    <span class="minute-badge" :class="getMinuteClass(row.minutes)">
                      {{ formatHoursFull(row.minutes) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-card card animate-fade-in-up">
        <h3>Delete Report?</h3>
        <p class="text-secondary" style="margin: var(--space-md) 0">
          This will permanently delete this report. This action cannot be undone.
        </p>
        <div style="display: flex; gap: var(--space-md); justify-content: flex-end">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="deleteReport" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const reportId = route.params.id

const report = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)
const deleting = ref(false)

// Fetch report
onMounted(async () => {
  try {
    const data = await $fetch(`/api/reports/${reportId}`)
    report.value = data
  } catch (err) {
    error.value = err.data?.statusMessage || 'Report not found'
  } finally {
    loading.value = false
  }
})

useHead({
  title: computed(() => report.value ? `${report.value.filename} — FocusReport` : 'Report — FocusReport'),
})

const rawData = computed(() => report.value?.rawData || {})
const rawRows = computed(() => rawData.value?.rows || [])
const dailyData = computed(() => rawData.value?.dailyData || [])
const projectData = computed(() => rawData.value?.projectData || [])
const stats = computed(() => rawData.value?.stats || {})
const maxDaily = computed(() => Math.max(...dailyData.value.map((d) => d.minutes), 1))

const insightParagraphs = computed(() => {
  if (!report.value?.aiInsight) return []
  return report.value.aiInsight.split('\n').filter((p) => p.trim())
})

const projectColors = ['#7c5dfa', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#06b6d4']

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateRange(start, end) {
  return `${formatDate(start)} — ${formatDate(end)}`
}

function formatHoursFull(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
}

function formatChartDateID(dateStr) {
  if (!dateStr) return ''
  let d
  if (dateStr.length === 8) {
    d = new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`)
  } else {
    d = new Date(dateStr)
  }
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${days[d.getDay()]} ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`
}

function getDayName(dateStr) {
  if (!dateStr) return '—'
  let d
  if (dateStr.length === 8) {
    d = new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`)
  } else {
    d = new Date(dateStr)
  }
  return d.toLocaleDateString('id-ID', { weekday: 'long' })
}

function getMinuteClass(minutes) {
  if (minutes >= 120) return 'high'
  if (minutes >= 60) return 'medium'
  return 'low'
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function deleteReport() {
  deleting.value = true
  try {
    await $fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
    navigateTo('/dashboard')
  } catch (err) {
    console.error('Failed to delete:', err)
  } finally {
    deleting.value = false
  }
}

function downloadPDF() {
  if (report.value?.pdfPath) {
    window.open(report.value.pdfPath, '_blank')
    return
  }

  if (!import.meta.client) return
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  const html = generatePDFHTML()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

function generatePDFHTML() {
  const r = report.value
  const s = stats.value
  const daily = dailyData.value
  const projects = projectData.value
  const maxD = maxDaily.value

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const range = `${formatDate(r.periodStart)} — ${formatDate(r.periodEnd)}`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${r.filename} - FocusReport</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif; 
      color: #1e293b; 
      line-height: 1.5; 
      padding: 50px;
      background: #fff;
    }
    .main-title { 
      text-align: center; 
      font-size: 28px; 
      font-weight: 700; 
      color: #0f172a;
      margin-bottom: 8px;
    }
    .subtitle {
      text-align: center;
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
    }
    .divider {
      height: 2px;
      background: #3b82f6;
      width: 100%;
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 50px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-top: 4px solid #3b82f6;
      border-radius: 4px;
      padding: 20px 15px;
    }
    .summary-card .label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .summary-card .value {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .summary-card .subtext {
      font-size: 12px;
      color: #94a3b8;
    }

    .chart-container {
      margin-bottom: 50px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .bar-label {
      width: 100px;
      font-size: 12px;
      color: #475569;
      flex-shrink: 0;
    }
    .bar-track {
      flex: 1;
      height: 28px;
      background: #f1f5f9;
      border-radius: 2px;
      margin: 0 15px;
      position: relative;
    }
    .bar-fill {
      height: 100%;
      background: #1d4ed8;
      border-radius: 2px;
    }
    .bar-fill.longest {
      background: #b91c1c;
    }
    .bar-value {
      width: 60px;
      font-size: 12px;
      color: #475569;
      text-align: left;
    }

    .table-container {
      margin-bottom: 50px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #0f172a;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      text-align: left;
      padding: 12px 15px;
    }
    td {
      padding: 10px 15px;
      font-size: 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }

    .insight-page {
      page-break-before: always;
      padding-top: 30px;
    }
    .insight-content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 25px;
    }
    .insight-content p {
      margin-bottom: 15px;
      font-size: 14px;
      color: #334155;
      line-height: 1.7;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <h1 class="main-title">Laporan Aktivitas Harian</h1>
  <p class="subtitle">Periode: ${range} • Digenerate: ${today}</p>
  <div class="divider"></div>

  <h2 class="section-title">Ringkasan</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Waktu</div>
      <div class="value">${formatHoursFull(s.totalMinutes)}</div>
      <div class="subtext">${s.totalMinutes} menit</div>
    </div>
    <div class="summary-card">
      <div class="label">Hari Aktif</div>
      <div class="value">${s.activeDays}</div>
      <div class="subtext">hari tercatat</div>
    </div>
    <div class="summary-card">
      <div class="label">Rata-rata/Hari</div>
      <div class="value">${formatHoursFull(s.avgPerDay)}</div>
      <div class="subtext">${s.avgPerDay} menit</div>
    </div>
    <div class="summary-card">
      <div class="label">Hari Terpanjang</div>
      <div class="value">${getDayName(s.longestDay?.date)}</div>
      <div class="subtext">${formatHoursFull(s.longestDay?.minutes || 0)}</div>
    </div>
  </div>

  <h2 class="section-title">Grafik Durasi per Hari</h2>
  <div class="chart-container">
    ${daily.map((d) => `
      <div class="bar-row">
        <span class="bar-label">${formatChartDateID(d.date)}</span>
        <div class="bar-track">
          <div class="bar-fill ${d.minutes === s.longestDay?.minutes ? 'longest' : ''}" style="width: ${(d.minutes / maxD * 100)}%"></div>
        </div>
        <span class="bar-value">${formatHoursFull(d.minutes)}</span>
      </div>
    `).join('')}
  </div>

  <h2 class="section-title">Detail Data Harian</h2>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width: 50px">No</th>
          <th>Tanggal</th>
          <th>Durasi</th>
          <th>Proyek</th>
        </tr>
      </thead>
      <tbody>
        ${rawRows.value.map((row, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${formatChartDateID(row.date)}</td>
            <td>${formatHoursFull(row.minutes)}</td>
            <td>${row.project || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="insight-page">
    <h2 class="section-title">Analisis & Insight</h2>
    <div class="insight-content">
      ${insightParagraphs.value.map((p) => `<p>${p}</p>`).join('')}
    </div>
  </div>

  <div class="footer">
    <p>Dihasilkan secara otomatis oleh FocusReport • Pomofocus Reporter SaaS</p>
  </div>
</body>
</html>`
}

</script>

<style scoped>
.report-detail {
  padding: var(--space-2xl) 0;
}

.report-header {
  margin-bottom: var(--space-2xl);
}

.report-header .btn-ghost {
  margin-bottom: var(--space-lg);
}

.report-header-info {
  margin-bottom: var(--space-lg);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: var(--space-xs);
}

.report-actions {
  display: flex;
  gap: var(--space-md);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-3xl);
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

/* AI Insight */
.insight-card {
  margin-bottom: var(--space-xl);
}

.insight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.insight-header h3 {
  font-size: 1.1rem;
}

.insight-paragraph {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
  margin-bottom: var(--space-md);
}

.insight-paragraph:last-child {
  margin-bottom: 0;
}

/* Chart */
.chart-card {
  margin-bottom: var(--space-xl);
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.bar-label {
  width: 60px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 22px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: var(--radius-sm);
  animation: growWidth 0.6s ease forwards;
  transform-origin: left;
}

@keyframes growWidth {
  from { width: 0 !important; }
}

.bar-value {
  width: 50px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-align: right;
  flex-shrink: 0;
}

/* Project */
.project-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.project-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.project-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 120px;
  flex-shrink: 0;
}

.project-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-name {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-bar-track {
  flex: 1;
  height: 8px;
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.project-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s ease;
}

.project-value {
  font-size: 0.8rem;
  font-weight: 600;
  width: 100px;
  text-align: right;
  flex-shrink: 0;
}

.project-pct {
  color: var(--text-tertiary);
  font-weight: 400;
}

/* Highlights */
.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.highlight-card {
  text-align: center;
  padding: var(--space-xl);
}

.highlight-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: var(--space-sm);
}

.highlight-card h4 {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

/* Data Table */
.table-section {
  margin-bottom: var(--space-xl);
}

.minute-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.minute-badge.high {
  background: var(--success-bg);
  color: var(--success);
}

.minute-badge.medium {
  background: var(--info-bg);
  color: var(--info);
}

.minute-badge.low {
  background: var(--warning-bg);
  color: var(--warning);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 90%;
  max-width: 420px;
  padding: var(--space-xl);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .highlights-grid {
    grid-template-columns: 1fr;
  }

  .report-actions {
    flex-direction: column;
  }

  .bar-label {
    width: 45px;
    font-size: 0.65rem;
  }
}
</style>
