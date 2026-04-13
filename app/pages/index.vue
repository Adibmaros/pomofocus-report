<template>
  <div class="app-wrapper">
    <!-- Ambient background effects -->
    <div class="bg-effects">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="bg-grid"></div>
    </div>

    <main class="main-content">
      <!-- Header -->
      <header class="hero">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          CSV → PDF Report
        </div>
        <h1 class="hero-title">
          <span class="text-gradient">FocusReport</span>
        </h1>
        <p class="hero-subtitle">
          Upload data Pomofocus CSV kamu, dapatkan laporan produktivitas PDF yang informatif. Gratis, tanpa login.
        </p>
      </header>

      <!-- Upload Section -->
      <section class="upload-section" v-if="!isProcessing && !reportReady">
        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          id="upload-zone"
        >
          <input
            type="file"
            ref="fileInput"
            accept=".csv"
            @change="handleFileSelect"
            style="display: none"
            id="csv-file-input"
          />
          <div class="upload-zone-visual">
            <div class="upload-icon-wrapper">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div class="upload-zone-text">
              <p class="upload-zone-title">Drag & drop file CSV di sini</p>
              <p class="upload-zone-subtitle">atau klik untuk memilih file</p>
            </div>
            <div class="upload-zone-formats">
              <span class="format-tag">.CSV</span>
              <span class="format-info">Pomofocus export format</span>
            </div>
          </div>
        </div>

        <!-- Info cards -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-icon">📊</div>
            <h3 class="info-card-title">Statistik Lengkap</h3>
            <p class="info-card-desc">Total waktu, hari aktif, rata-rata, dan distribusi proyek dalam satu laporan.</p>
          </div>
          <div class="info-card">
            <div class="info-card-icon">📈</div>
            <h3 class="info-card-title">Grafik Visual</h3>
            <p class="info-card-desc">Bar chart durasi per hari dan breakdown proyek untuk visualisasi data yang jelas.</p>
          </div>
          <div class="info-card">
            <div class="info-card-icon">🤖</div>
            <h3 class="info-card-title">AI Insight</h3>
            <p class="info-card-desc">Analisis otomatis dengan AI untuk menemukan pola produktivitas dan saran peningkatan.</p>
          </div>
        </div>
      </section>

      <!-- Processing State -->
      <section class="processing-section" v-if="isProcessing">
        <div class="processing-card">
          <div class="processing-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring spinner-ring-2"></div>
            <div class="spinner-dot"></div>
          </div>
          <h2 class="processing-title">Memproses Data...</h2>
          <p class="processing-subtitle">{{ processingMessage }}</p>
          <div class="processing-steps">
            <div class="step" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
              <div class="step-indicator">
                <svg v-if="currentStep > 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span v-else>1</span>
              </div>
              <span>Parsing CSV</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
              <div class="step-indicator">
                <svg v-if="currentStep > 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span v-else>2</span>
              </div>
              <span>Menghitung Statistik</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 3, done: currentStep > 3 }">
              <div class="step-indicator">
                <svg v-if="currentStep > 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span v-else>3</span>
              </div>
              <span>Membuat PDF</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Result Section -->
      <section class="result-section" v-if="reportReady && !isProcessing">
        <div class="result-card">
          <div class="result-icon-wrapper">
            <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 class="result-title">Laporan Siap!</h2>
          <p class="result-subtitle">PDF laporan produktivitas kamu sudah berhasil dibuat.</p>

          <!-- Stats preview -->
          <div class="stats-preview" v-if="reportStats">
            <div class="stat-pill">
              <span class="stat-pill-label">Total</span>
              <span class="stat-pill-value">{{ formatDuration(reportStats.totalMinutes) }}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill-label">Hari Aktif</span>
              <span class="stat-pill-value">{{ reportStats.activeDays }} hari</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill-label">Rata-rata</span>
              <span class="stat-pill-value">{{ formatDuration(reportStats.avgPerDay) }}/hari</span>
            </div>
            <div class="stat-pill" v-if="reportStats.projectCount > 1">
              <span class="stat-pill-label">Proyek</span>
              <span class="stat-pill-value">{{ reportStats.projectCount }} proyek</span>
            </div>
          </div>

          <div class="result-actions">
            <button class="btn btn-primary btn-lg" @click="downloadPDF" id="download-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <button class="btn btn-secondary" @click="resetState" id="reset-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Upload Lagi
            </button>
          </div>
        </div>
      </section>

      <!-- Error toast -->
      <Transition name="toast">
        <div class="toast toast-error" v-if="errorMessage" @click="errorMessage = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {{ errorMessage }}
        </div>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>FocusReport — Dibuat dengan ❤️ untuk produktivitas</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Papa from 'papaparse'

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const reportReady = ref(false)
const errorMessage = ref('')
const processingMessage = ref('')
const currentStep = ref(0)

const pdfBase64 = ref('')
const pdfFilename = ref('')
const reportStats = ref<any>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    processFile(input.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0]
    if (file.name.endsWith('.csv')) {
      processFile(file)
    } else {
      errorMessage.value = 'Hanya file .csv yang diterima'
      setTimeout(() => (errorMessage.value = ''), 4000)
    }
  }
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
}

async function processFile(file: File) {
  isProcessing.value = true
  currentStep.value = 1
  processingMessage.value = 'Membaca dan parsing file CSV...'
  errorMessage.value = ''

  try {
    // Step 1: Parse CSV
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (!parsed.data || parsed.data.length === 0) {
      throw new Error('File CSV kosong atau format tidak dikenali.')
    }

    // Auto-detect columns
    const firstRow = parsed.data[0] as any
    const headers = Object.keys(firstRow)

    // Try to map columns
    const dateCol = headers.find((h) => /date|tanggal|hari/i.test(h)) || headers[0]
    const minutesCol = headers.find((h) => /minute|menit|duration|durasi|time|waktu/i.test(h)) || headers[1]
    const projectCol = headers.find((h) => /project|proyek|task|tugas|category|kategori/i.test(h))

    const data = parsed.data.map((row: any) => ({
      date: String(row[dateCol] || '').trim(),
      minutes: parseInt(String(row[minutesCol] || '0').replace(/[^0-9]/g, '')) || 0,
      project: projectCol ? String(row[projectCol] || '').trim() : '',
    })).filter((r: any) => r.date && r.minutes > 0)

    if (data.length === 0) {
      throw new Error('Tidak ada data valid ditemukan. Pastikan CSV memiliki kolom tanggal dan menit/durasi.')
    }

    // Step 2: Send to server
    await new Promise((r) => setTimeout(r, 500))
    currentStep.value = 2
    processingMessage.value = 'Menghitung statistik dan membuat analisis...'

    await new Promise((r) => setTimeout(r, 300))
    currentStep.value = 3
    processingMessage.value = 'Membuat PDF laporan...'

    const response = await $fetch('/api/generate', {
      method: 'POST',
      body: {
        filename: file.name,
        data,
      },
    })

    if (response.success) {
      pdfBase64.value = response.pdf
      pdfFilename.value = response.filename
      reportStats.value = response.stats
      currentStep.value = 4

      await new Promise((r) => setTimeout(r, 600))
      isProcessing.value = false
      reportReady.value = true
    }
  } catch (err: any) {
    isProcessing.value = false
    errorMessage.value = err?.data?.statusMessage || err.message || 'Terjadi kesalahan saat memproses file.'
    setTimeout(() => (errorMessage.value = ''), 6000)
  }
}

function downloadPDF() {
  if (!pdfBase64.value) return

  const byteCharacters = atob(pdfBase64.value)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = pdfFilename.value || 'report.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function resetState() {
  reportReady.value = false
  pdfBase64.value = ''
  pdfFilename.value = ''
  reportStats.value = null
  currentStep.value = 0
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
/* ===================================
   Layout
   =================================== */
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* ===================================
   Background Effects
   =================================== */
.bg-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(124, 93, 250, 0.15), transparent 70%);
  top: -150px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(192, 132, 252, 0.1), transparent 70%);
  bottom: -100px;
  left: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

.bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 30s ease-in-out infinite;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 50% at 50% 50%, black 40%, transparent 100%);
}

/* ===================================
   Hero
   =================================== */
.hero {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.6s ease forwards;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  background: rgba(124, 93, 250, 0.1);
  border: 1px solid rgba(124, 93, 250, 0.2);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent-light);
  margin-bottom: 1.5rem;
  letter-spacing: 0.02em;
}

.hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===================================
   Upload Zone
   =================================== */
.upload-section {
  width: 100%;
  animation: fadeInUp 0.7s ease forwards;
  animation-delay: 0.1s;
  opacity: 0;
}

.upload-zone {
  border: 2px dashed rgba(124, 93, 250, 0.25);
  border-radius: var(--radius-xl);
  padding: 3.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: rgba(22, 22, 31, 0.6);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.upload-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(124, 93, 250, 0.05), transparent 70%);
  transition: opacity var(--transition-normal);
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--accent);
  background: rgba(124, 93, 250, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(124, 93, 250, 0.15);
}

.upload-zone:hover::before,
.upload-zone.drag-over::before {
  opacity: 1;
}

.upload-zone-visual {
  position: relative;
  z-index: 1;
}

.upload-icon-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.5rem;
  border-radius: var(--radius-lg);
  background: rgba(124, 93, 250, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.upload-zone:hover .upload-icon-wrapper {
  background: rgba(124, 93, 250, 0.2);
  transform: scale(1.05);
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: var(--accent-light);
}

.upload-zone-text {
  margin-bottom: 1.5rem;
}

.upload-zone-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.upload-zone-subtitle {
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.upload-zone-formats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.format-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(124, 93, 250, 0.15);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-light);
  letter-spacing: 0.05em;
}

.format-info {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

/* ===================================
   Info Cards
   =================================== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.info-card {
  background: rgba(22, 22, 31, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all var(--transition-normal);
}

.info-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
}

.info-card-icon {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.info-card-desc {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  line-height: 1.5;
}

/* ===================================
   Processing
   =================================== */
.processing-section {
  width: 100%;
  animation: fadeIn 0.4s ease forwards;
}

.processing-card {
  background: rgba(22, 22, 31, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
}

.processing-spinner {
  width: 80px;
  height: 80px;
  position: relative;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring-2 {
  inset: 8px;
  border-top-color: var(--accent-light);
  animation-direction: reverse;
  animation-duration: 1.5s;
}

.spinner-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.processing-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.processing-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.processing-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  transition: all var(--transition-normal);
}

.step.active {
  color: var(--accent-light);
}

.step.done {
  color: var(--success);
}

.step-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step.done .step-indicator {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.step-indicator svg {
  width: 14px;
  height: 14px;
}

/* ===================================
   Result
   =================================== */
.result-section {
  width: 100%;
  animation: fadeInUp 0.5s ease forwards;
}

.result-card {
  background: rgba(22, 22, 31, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
}

.result-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: var(--success-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: glow-success 2s ease-in-out infinite;
}

@keyframes glow-success {
  0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.1); }
  50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.25); }
}

.result-icon {
  width: 36px;
  height: 36px;
  color: var(--success);
}

.result-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.result-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

/* Stats Preview */
.stats-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(124, 93, 250, 0.08);
  border: 1px solid rgba(124, 93, 250, 0.15);
  border-radius: var(--radius-full);
}

.stat-pill-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.stat-pill-value {
  font-size: 0.85rem;
  color: var(--accent-light);
  font-weight: 700;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* ===================================
   Toast
   =================================== */
.toast-enter-active {
  animation: slideInRight 0.3s ease forwards;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease forwards;
}

@keyframes slideOutRight {
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}

/* ===================================
   Footer
   =================================== */
.app-footer {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.8rem;
  position: relative;
  z-index: 1;
}

/* ===================================
   Responsive
   =================================== */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .processing-steps {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .result-actions {
    flex-direction: column;
  }

  .stats-preview {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .upload-zone {
    padding: 2.5rem 1.5rem;
  }
}
</style>
