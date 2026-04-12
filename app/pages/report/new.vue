<template>
  <div class="new-report" id="new-report-page">
    <div class="container container-md">
      <div class="page-header animate-fade-in-up">
        <NuxtLink to="/dashboard" class="btn btn-ghost btn-sm">← Back to Dashboard</NuxtLink>
        <h1 class="page-title">Create New <span class="text-gradient">Report</span></h1>
        <p class="page-subtitle">Upload your Pomofocus CSV to generate a productivity report</p>
      </div>

      <!-- Step Indicator -->
      <div class="steps-indicator animate-fade-in-up" style="animation-delay: 0.1s">
        <div :class="['step-dot', { active: step >= 1, done: step > 1 }]">
          <span>1</span>
          <p>Upload</p>
        </div>
        <div class="step-line" :class="{ active: step > 1 }"></div>
        <div :class="['step-dot', { active: step >= 2, done: step > 2 }]">
          <span>2</span>
          <p>Preview</p>
        </div>
        <div class="step-line" :class="{ active: step > 2 }"></div>
        <div :class="['step-dot', { active: step >= 3 }]">
          <span>3</span>
          <p>Generate</p>
        </div>
      </div>

      <!-- Step 1: Upload -->
      <div v-if="step === 1" class="animate-fade-in-up">
        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragging }"
          id="upload-zone"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <div class="upload-zone-icon">📤</div>
          <h3 class="upload-zone-title">
            {{ isDragging ? 'Drop your file here!' : 'Drag & drop your CSV file' }}
          </h3>
          <p class="upload-zone-subtitle">or click to browse — supports Pomofocus CSV export</p>
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <div class="upload-info card" style="margin-top: var(--space-lg)">
          <h4 style="margin-bottom: var(--space-sm)">📋 Expected CSV Format</h4>
          <code class="csv-example">
            date,project,minutes<br />
            20260406,,74<br />
            20260407,Skripsi,120<br />
            20260408,Freelance,90
          </code>
          <p class="form-hint" style="margin-top: var(--space-sm)">
            Column "project" can be empty. Date format: YYYYMMDD.
          </p>
        </div>
      </div>

      <!-- Step 2: Preview -->
      <div v-if="step === 2" class="animate-fade-in-up">
        <div class="preview-header">
          <div>
            <h3>📄 {{ fileName }}</h3>
            <p class="text-secondary" style="font-size: 0.85rem">
              {{ parsedData.length }} rows found • Period: {{ formatDate(previewStats.periodStart) }} — {{ formatDate(previewStats.periodEnd) }}
            </p>
          </div>
          <button class="btn btn-ghost btn-sm" @click="resetUpload">Change File</button>
        </div>

        <!-- Quick Stats Preview -->
        <div class="preview-stats-grid stagger-children">
          <div class="stat-card">
            <span class="stat-label">Total Time</span>
            <span class="stat-value">{{ formatMinutesLong(previewStats.totalMinutes) }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Active Days</span>
            <span class="stat-value">{{ previewStats.activeDays }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Avg/Day</span>
            <span class="stat-value">{{ formatMinutesLong(previewStats.avgPerDay) }}</span>
          </div>
        </div>

        <!-- Data Table Preview -->
        <div class="table-container" style="max-height: 400px; overflow-y: auto">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Minutes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in parsedData.slice(0, 50)" :key="i">
                <td>{{ formatCsvDate(row.date) }}</td>
                <td>{{ row.project || '—' }}</td>
                <td>{{ row.minutes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="parsedData.length > 50" class="form-hint" style="margin-top: var(--space-sm)">
          Showing 50 of {{ parsedData.length }} rows
        </p>

        <div class="preview-actions">
          <button class="btn btn-secondary" @click="step = 1">← Back</button>
          <button class="btn btn-primary btn-lg" @click="generateReport" id="generate-btn">
            ⚡ Generate Report
          </button>
        </div>
      </div>

      <!-- Step 3: Generating -->
      <div v-if="step === 3" class="animate-fade-in-up">
        <div class="generating-card card" style="text-align: center">
          <template v-if="generating">
            <div class="generating-animation">
              <div class="spinner spinner-lg"></div>
            </div>
            <h3 style="margin-top: var(--space-lg)">Generating your report...</h3>
            <p class="text-secondary" style="margin-top: var(--space-sm)">
              {{ generatingStep }}
            </p>
            <div class="progress-bar" style="margin-top: var(--space-lg)">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </template>

          <template v-else-if="generateError">
            <div style="font-size: 3rem; margin-bottom: var(--space-md)">❌</div>
            <h3>Generation Failed</h3>
            <p class="text-secondary" style="margin-top: var(--space-sm)">{{ generateError }}</p>
            <div style="margin-top: var(--space-xl); display: flex; gap: var(--space-md); justify-content: center">
              <button class="btn btn-secondary" @click="step = 2">← Back to Preview</button>
              <button class="btn btn-primary" @click="generateReport">Retry</button>
            </div>
          </template>

          <template v-else>
            <div style="font-size: 3rem; margin-bottom: var(--space-md)">🎉</div>
            <h3>Report Generated Successfully!</h3>
            <p class="text-secondary" style="margin-top: var(--space-sm)">
              Your productivity report is ready to view and download
            </p>
            <div style="margin-top: var(--space-xl); display: flex; gap: var(--space-md); justify-content: center">
              <NuxtLink :to="`/report/${generatedReportId}`" class="btn btn-primary btn-lg">
                📄 View Report
              </NuxtLink>
              <NuxtLink to="/dashboard" class="btn btn-secondary">Dashboard</NuxtLink>
            </div>
          </template>
        </div>
      </div>

      <div v-if="errorMessage" class="toast toast-error" id="upload-error">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import Papa from 'papaparse'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'New Report — FocusReport',
})

const fileInput = ref(null)
const step = ref(1)
const isDragging = ref(false)
const fileName = ref('')
const parsedData = ref([])
const errorMessage = ref('')
const generating = ref(false)
const generatingStep = ref('')
const progress = ref(0)
const generateError = ref('')
const generatedReportId = ref('')

const previewStats = computed(() => {
  if (parsedData.value.length === 0) return {}

  const data = parsedData.value
  const totalMinutes = data.reduce((sum, r) => sum + (parseInt(r.minutes) || 0), 0)

  // Group by date for unique active days
  const uniqueDates = [...new Set(data.map((r) => r.date))]
  const activeDays = uniqueDates.length

  const dates = data.map((r) => r.date).sort()

  return {
    totalMinutes,
    activeDays,
    avgPerDay: activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0,
    periodStart: dates[0],
    periodEnd: dates[dates.length - 1],
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) processFile(file)
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

function processFile(file) {
  errorMessage.value = ''

  if (!file.name.endsWith('.csv')) {
    errorMessage.value = 'Please upload a .csv file'
    setTimeout(() => (errorMessage.value = ''), 3000)
    return
  }

  fileName.value = file.name

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      const data = results.data

      // Validate columns
      const headers = Object.keys(data[0] || {}).map((h) => h.toLowerCase().trim())
      if (!headers.includes('date') || !headers.includes('minutes')) {
        errorMessage.value = 'CSV must contain "date" and "minutes" columns'
        setTimeout(() => (errorMessage.value = ''), 5000)
        return
      }

      // Normalize data
      parsedData.value = data
        .map((row) => {
          const normalized = {}
          for (const [key, value] of Object.entries(row)) {
            normalized[key.toLowerCase().trim()] = typeof value === 'string' ? value.trim() : value
          }
          return normalized
        })
        .filter((row) => row.date && row.minutes)

      if (parsedData.value.length === 0) {
        errorMessage.value = 'No valid data rows found in CSV'
        setTimeout(() => (errorMessage.value = ''), 5000)
        return
      }

      step.value = 2
    },
    error(err) {
      errorMessage.value = 'Failed to parse CSV: ' + err.message
      setTimeout(() => (errorMessage.value = ''), 5000)
    },
  })
}

function resetUpload() {
  step.value = 1
  fileName.value = ''
  parsedData.value = []
}

async function generateReport() {
  step.value = 3
  generating.value = true
  generateError.value = ''
  progress.value = 0
  generatingStep.value = 'Parsing data...'

  try {
    // Simulate step progress
    progress.value = 20
    generatingStep.value = 'Calculating statistics...'
    await new Promise((r) => setTimeout(r, 500))

    progress.value = 40
    generatingStep.value = 'Generating AI insights...'

    const response = await $fetch('/api/reports/generate', {
      method: 'POST',
      body: {
        filename: fileName.value,
        data: parsedData.value,
      },
    })

    progress.value = 80
    generatingStep.value = 'Creating report...'
    await new Promise((r) => setTimeout(r, 500))

    progress.value = 100
    generatingStep.value = 'Done!'
    await new Promise((r) => setTimeout(r, 300))

    generatedReportId.value = response.report.id
    generating.value = false
  } catch (err) {
    generating.value = false
    generateError.value = err.data?.statusMessage || 'Failed to generate report. Please try again.'
  }
}

function formatCsvDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr
  const year = dateStr.substring(0, 4)
  const month = dateStr.substring(4, 6)
  const day = dateStr.substring(6, 8)
  return `${year}-${month}-${day}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const formatted = formatCsvDate(dateStr)
  return new Date(formatted).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMinutesLong(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return `${h}h ${m}m`
}
</script>

<style scoped>
.new-report {
  padding: var(--space-2xl) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.page-header .btn {
  margin-bottom: var(--space-lg);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: var(--space-2xl);
}

.step-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.step-dot span {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  color: var(--text-tertiary);
  transition: all var(--transition-normal);
}

.step-dot.active span {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  box-shadow: 0 0 20px rgba(124, 93, 250, 0.3);
}

.step-dot.done span {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.step-dot p {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.step-dot.active p {
  color: var(--accent-light);
}

.step-line {
  width: 80px;
  height: 2px;
  background: var(--border-color);
  margin: 0 var(--space-sm);
  margin-bottom: 20px;
  transition: background var(--transition-normal);
}

.step-line.active {
  background: var(--accent);
}

/* Upload Info */
.csv-example {
  display: block;
  background: var(--bg-primary);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.8;
  font-family: var(--font-mono);
}

/* Preview */
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.preview-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.preview-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-xl);
}

/* Generating */
.generating-card {
  padding: var(--space-3xl);
}

.generating-animation {
  display: flex;
  justify-content: center;
}

.progress-bar {
  height: 4px;
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  overflow: hidden;
  max-width: 300px;
  margin: 0 auto;
}

.progress-fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

@media (max-width: 768px) {
  .preview-stats-grid {
    grid-template-columns: 1fr;
  }

  .preview-actions {
    flex-direction: column;
    gap: var(--space-md);
  }

  .step-line {
    width: 40px;
  }
}
</style>
