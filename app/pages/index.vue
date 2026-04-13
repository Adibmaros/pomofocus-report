<template>
  <div data-theme="focusreport" class="min-h-screen bg-base-100 flex flex-col relative overflow-hidden font-sans">
    <!-- Ambient blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" style="animation: float 20s ease-in-out infinite;"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" style="animation: float 25s ease-in-out infinite reverse;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-secondary/30 blur-[120px]"></div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10 max-w-3xl mx-auto w-full">

      <!-- Hero -->
      <header class="text-center mb-10 animate-fade-in-up">
        <div class="badge badge-primary badge-outline gap-2 mb-5 text-xs font-semibold tracking-wide">
          <span class="w-1.5 h-1.5 rounded-full bg-primary" style="animation: pulse-soft 2s ease-in-out infinite;"></span>
          CSV → PDF Report
        </div>
        <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">FocusReport</span>
        </h1>
        <p class="text-base-content/60 text-lg max-w-md mx-auto leading-relaxed">
          Upload data Pomofocus CSV kamu, dapatkan laporan produktivitas PDF yang informatif. <strong class="text-base-content/80">Gratis, tanpa login.</strong>
        </p>
        <!-- Guide trigger -->
        <button class="btn btn-ghost btn-sm gap-2 mt-4 text-primary hover:bg-primary/10 border-primary/20" @click="showGuide = true" id="guide-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          Pelajari alur aplikasi
        </button>
      </header>

      <!-- Upload Section -->
      <section class="w-full animate-fade-in-up-delay-1" v-if="!isProcessing && !reportReady">
        <div
          class="border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 group"
          :class="isDragging
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]'
            : 'border-base-300 bg-base-100/80 hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-md'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          id="upload-zone"
        >
          <input type="file" ref="fileInput" accept=".csv" @change="handleFileSelect" class="hidden" id="csv-file-input" />

          <div class="mx-auto w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-all group-hover:bg-primary/15 group-hover:scale-105">
            <svg class="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p class="text-lg font-semibold text-base-content mb-1">Drag & drop file CSV di sini</p>
          <p class="text-sm text-base-content/50 mb-5">atau klik untuk memilih file</p>

          <div class="flex items-center justify-center gap-3">
            <span class="badge badge-primary badge-sm font-bold">.CSV</span>
            <span class="text-xs text-base-content/40">Pomofocus export format</span>
          </div>
        </div>

        <!-- Feature cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 animate-fade-in-up-delay-2">
          <div class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div class="card-body p-5">
              <div class="text-2xl mb-1">📊</div>
              <h3 class="font-semibold text-sm text-base-content">Statistik Lengkap</h3>
              <p class="text-xs text-base-content/50 leading-relaxed">Total waktu, hari aktif, rata-rata, dan distribusi proyek.</p>
            </div>
          </div>
          <div class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div class="card-body p-5">
              <div class="text-2xl mb-1">📈</div>
              <h3 class="font-semibold text-sm text-base-content">Grafik Visual</h3>
              <p class="text-xs text-base-content/50 leading-relaxed">Bar chart durasi per hari dan breakdown proyek.</p>
            </div>
          </div>
          <div class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div class="card-body p-5">
              <div class="text-2xl mb-1">🤖</div>
              <h3 class="font-semibold text-sm text-base-content">AI Insight</h3>
              <p class="text-xs text-base-content/50 leading-relaxed">Analisis produktivitas & saran peningkatan otomatis.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Processing State -->
      <section class="w-full" v-if="isProcessing">
        <div class="card bg-base-100 border border-base-300 shadow-lg">
          <div class="card-body items-center text-center py-14">
            <!-- Spinner -->
            <div class="relative w-16 h-16 mb-6">
              <div class="absolute inset-0 border-[3px] border-transparent border-t-primary rounded-full" style="animation: spin 1s linear infinite;"></div>
              <div class="absolute inset-2 border-[3px] border-transparent border-t-accent rounded-full" style="animation: spin 1.5s linear infinite reverse;"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-2.5 h-2.5 bg-primary rounded-full" style="animation: pulse-soft 1.5s ease-in-out infinite;"></div>
              </div>
            </div>

            <h2 class="text-xl font-bold text-base-content">Memproses Data...</h2>
            <p class="text-sm text-base-content/50 mb-6">{{ processingMessage }}</p>

            <!-- Steps -->
            <ul class="steps steps-horizontal text-xs">
              <li class="step" :class="currentStep >= 1 ? 'step-primary' : ''">Parsing</li>
              <li class="step" :class="currentStep >= 2 ? 'step-primary' : ''">Statistik</li>
              <li class="step" :class="currentStep >= 3 ? 'step-primary' : ''">PDF</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Result -->
      <section class="w-full animate-fade-in-up" v-if="reportReady && !isProcessing">
        <div class="card bg-base-100 border border-base-300 shadow-lg">
          <div class="card-body items-center text-center py-12">
            <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h2 class="text-2xl font-bold text-base-content">Laporan Siap! 🎉</h2>
            <p class="text-sm text-base-content/50 mb-6">PDF laporan produktivitas kamu sudah berhasil dibuat.</p>

            <!-- Stats pill -->
            <div class="flex flex-wrap justify-center gap-2 mb-8" v-if="reportStats">
              <div class="badge badge-lg badge-outline gap-2 py-3" v-for="stat in statPills" :key="stat.label">
                <span class="text-base-content/40 text-xs">{{ stat.label }}</span>
                <span class="font-bold text-primary text-sm">{{ stat.value }}</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button class="btn btn-primary gap-2 shadow-md shadow-primary/20" @click="downloadPDF" id="download-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
              <button class="btn btn-ghost gap-2" @click="resetState" id="reset-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Upload Lagi
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Error alert -->
      <div class="toast toast-top toast-end z-50" v-if="errorMessage">
        <div class="alert alert-error shadow-lg cursor-pointer" @click="errorMessage = ''">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="text-sm">{{ errorMessage }}</span>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 text-xs text-base-content/30 relative z-10">
      FocusReport — Dibuat dengan ❤️ untuk produktivitas
    </footer>

    <!-- ===================================
         Guide Modal
         =================================== -->
    <dialog class="modal" :class="{ 'modal-open': showGuide }" id="guide-modal">
      <div class="modal-box max-w-2xl bg-base-100 p-0 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-purple-500 px-6 py-5 text-white">
          <h3 class="font-bold text-lg">📖 Cara Menggunakan FocusReport</h3>
          <p class="text-sm text-white/70 mt-1">Dari Pomofocus sampai PDF laporan dalam hitungan detik</p>
        </div>

        <!-- Steps -->
        <div class="px-6 py-6 space-y-1 max-h-[65vh] overflow-y-auto">

          <!-- Step 1 -->
          <div class="collapse collapse-arrow bg-base-200/50 rounded-xl">
            <input type="radio" name="guide-accordion" checked />
            <div class="collapse-title font-semibold flex items-center gap-3">
              <div class="badge badge-primary badge-sm font-bold w-7 h-7 p-0 text-xs">1</div>
              Gunakan Pomofocus untuk Sesi Fokus
            </div>
            <div class="collapse-content text-sm text-base-content/70 leading-relaxed">
              <div class="pl-10 space-y-2">
                <p>Buka <a href="https://pomofocus.io" target="_blank" class="link link-primary font-medium">pomofocus.io</a> dan mulai sesi Pomodoro kamu seperti biasa.</p>
                <p>Setiap sesi yang kamu jalankan akan tercatat secara otomatis — termasuk <strong>tanggal</strong>, <strong>durasi</strong>, dan <strong>proyek</strong> yang dipilih.</p>
                <div class="bg-base-200 rounded-lg p-3 mt-2">
                  <p class="text-xs text-base-content/50">💡 <strong>Tips:</strong> Buat beberapa proyek di Pomofocus (misal: "Coding", "Belajar", "Menulis") agar laporan kamu lebih informatif.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="collapse collapse-arrow bg-base-200/50 rounded-xl">
            <input type="radio" name="guide-accordion" />
            <div class="collapse-title font-semibold flex items-center gap-3">
              <div class="badge badge-primary badge-sm font-bold w-7 h-7 p-0 text-xs">2</div>
              Export Data dari Pomofocus
            </div>
            <div class="collapse-content text-sm text-base-content/70 leading-relaxed">
              <div class="pl-10 space-y-2">
                <p>Setelah beberapa hari menggunakan Pomofocus, export data kamu:</p>
                <ol class="list-decimal list-inside space-y-1.5 ml-1">
                  <li>Klik menu <strong>Report</strong> di sidebar kiri Pomofocus</li>
                  <li>Pilih rentang tanggal yang ingin di-export</li>
                  <li>Klik tombol <strong>"Export as CSV"</strong> di bagian bawah</li>
                  <li>File <code class="bg-base-300 px-1.5 py-0.5 rounded text-xs font-mono">.csv</code> akan terdownload otomatis</li>
                </ol>
                <div class="bg-base-200 rounded-lg p-3 mt-2">
                  <p class="text-xs text-base-content/50">📁 File CSV berisi kolom: tanggal, durasi (menit), dan nama proyek.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="collapse collapse-arrow bg-base-200/50 rounded-xl">
            <input type="radio" name="guide-accordion" />
            <div class="collapse-title font-semibold flex items-center gap-3">
              <div class="badge badge-primary badge-sm font-bold w-7 h-7 p-0 text-xs">3</div>
              Upload CSV ke FocusReport
            </div>
            <div class="collapse-content text-sm text-base-content/70 leading-relaxed">
              <div class="pl-10 space-y-2">
                <p>Di halaman utama FocusReport:</p>
                <ul class="list-disc list-inside space-y-1.5 ml-1">
                  <li><strong>Drag & drop</strong> file CSV ke area upload, atau</li>
                  <li><strong>Klik</strong> area upload untuk memilih file dari komputer</li>
                </ul>
                <p>Sistem akan otomatis mendeteksi kolom-kolom pada CSV kamu — tidak perlu konfigurasi manual.</p>
              </div>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="collapse collapse-arrow bg-base-200/50 rounded-xl">
            <input type="radio" name="guide-accordion" />
            <div class="collapse-title font-semibold flex items-center gap-3">
              <div class="badge badge-primary badge-sm font-bold w-7 h-7 p-0 text-xs">4</div>
              Proses & Generate Laporan
            </div>
            <div class="collapse-content text-sm text-base-content/70 leading-relaxed">
              <div class="pl-10 space-y-2">
                <p>Setelah upload, FocusReport secara otomatis akan:</p>
                <div class="space-y-3 mt-2">
                  <div class="flex gap-3 items-start">
                    <div class="badge badge-outline badge-sm mt-0.5 shrink-0">a</div>
                    <p><strong>Parsing CSV</strong> — Membaca dan memvalidasi data dari file</p>
                  </div>
                  <div class="flex gap-3 items-start">
                    <div class="badge badge-outline badge-sm mt-0.5 shrink-0">b</div>
                    <p><strong>Menghitung Statistik</strong> — Total waktu, hari aktif, rata-rata per hari, hari paling produktif, distribusi proyek</p>
                  </div>
                  <div class="flex gap-3 items-start">
                    <div class="badge badge-outline badge-sm mt-0.5 shrink-0">c</div>
                    <p><strong>AI Insight</strong> — Analisis pola produktivitas & saran peningkatan (jika tersedia)</p>
                  </div>
                  <div class="flex gap-3 items-start">
                    <div class="badge badge-outline badge-sm mt-0.5 shrink-0">d</div>
                    <p><strong>Generate PDF</strong> — Menyusun semua data ke dalam laporan PDF profesional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5 -->
          <div class="collapse collapse-arrow bg-base-200/50 rounded-xl">
            <input type="radio" name="guide-accordion" />
            <div class="collapse-title font-semibold flex items-center gap-3">
              <div class="badge badge-primary badge-sm font-bold w-7 h-7 p-0 text-xs">5</div>
              Download Laporan PDF
            </div>
            <div class="collapse-content text-sm text-base-content/70 leading-relaxed">
              <div class="pl-10 space-y-2">
                <p>Setelah proses selesai, kamu bisa langsung klik <strong>"Download PDF"</strong> untuk menyimpan laporan.</p>
                <p>Laporan PDF berisi:</p>
                <ul class="list-disc list-inside space-y-1 ml-1">
                  <li>📊 Ringkasan statistik (Total waktu, hari aktif, rata-rata)</li>
                  <li>📈 Grafik bar chart durasi per hari</li>
                  <li>📋 Tabel detail data harian</li>
                  <li>🧩 Distribusi proyek (jika ada lebih dari 1 proyek)</li>
                  <li>🤖 Analisis & insight AI</li>
                </ul>
                <div class="bg-base-200 rounded-lg p-3 mt-2">
                  <p class="text-xs text-base-content/50">🔄 Klik <strong>"Upload Lagi"</strong> untuk memproses file CSV yang berbeda.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-base-300 flex justify-between items-center">
          <p class="text-xs text-base-content/40">Data kamu diproses di server dan tidak disimpan.</p>
          <button class="btn btn-primary btn-sm" @click="showGuide = false" id="close-guide-btn">Mengerti!</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop bg-black/30" @click="showGuide = false">
        <button>close</button>
      </form>
    </dialog>

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
const showGuide = ref(false)

const pdfBase64 = ref('')
const pdfFilename = ref('')
const reportStats = ref<any>(null)

const statPills = computed(() => {
  if (!reportStats.value) return []
  const stats = []
  stats.push({ label: 'Total', value: formatDuration(reportStats.value.totalMinutes) })
  stats.push({ label: 'Hari Aktif', value: `${reportStats.value.activeDays} hari` })
  stats.push({ label: 'Rata-rata', value: `${formatDuration(reportStats.value.avgPerDay)}/hari` })
  if (reportStats.value.projectCount > 1) {
    stats.push({ label: 'Proyek', value: `${reportStats.value.projectCount} proyek` })
  }
  return stats
})

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
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (!parsed.data || parsed.data.length === 0) {
      throw new Error('File CSV kosong atau format tidak dikenali.')
    }

    const firstRow = parsed.data[0] as any
    const headers = Object.keys(firstRow)

    const dateCol = headers.find((h) => /date|tanggal|hari/i.test(h)) || headers[0] || 'date'
    const minutesCol = headers.find((h) => /minute|menit|duration|durasi|time|waktu/i.test(h)) || headers[1] || 'minutes'
    const projectCol = headers.find((h) => /project|proyek|task|tugas|category|kategori/i.test(h))

    const data = parsed.data.map((row: any) => ({
      date: String(row[dateCol as string] || '').trim(),
      minutes: parseInt(String(row[minutesCol as string] || '0').replace(/[^0-9]/g, '')) || 0,
      project: projectCol ? String(row[projectCol] || '').trim() : '',
    })).filter((r: any) => r.date && r.minutes > 0)

    if (data.length === 0) {
      throw new Error('Tidak ada data valid ditemukan. Pastikan CSV memiliki kolom tanggal dan menit/durasi.')
    }

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
