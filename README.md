# FocusReport

> Upload file CSV Pomofocus, dapatkan laporan produktivitas PDF yang informatif dan siap download. Gratis, tanpa login.

## Fitur

- **Upload CSV** — Drag & drop atau klik untuk upload file CSV dari Pomofocus
- **Auto-detect kolom** — Otomatis mengenali kolom tanggal, durasi, dan proyek
- **Statistik lengkap** — Total waktu, hari aktif, rata-rata per hari, distribusi proyek
- **Grafik visual** — Bar chart durasi per hari dalam PDF
- **AI Insight** — Analisis produktivitas dengan AI (opsional, butuh Groq API key)
- **Download PDF** — Laporan siap download dalam format PDF

## Cara Pakai

1. Buka aplikasi
2. Upload file CSV dari Pomofocus
3. Tunggu proses selesai
4. Download PDF laporan

## Setup Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# (Opsional) Isi GROQ_API_KEY untuk fitur AI insight

# Jalankan dev server
npm run dev
```

## Format CSV

File CSV harus memiliki minimal 2 kolom:
- **date** — Tanggal (format: YYYY-MM-DD atau YYYYMMDD)
- **minutes** — Durasi dalam menit

Kolom opsional:
- **project** — Nama proyek/kategori

Contoh:
```csv
date,minutes,project
2026-04-01,45,Coding
2026-04-02,60,Reading
2026-04-03,30,Writing
```

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3)
- **PDF**: jsPDF + jspdf-autotable
- **CSV Parser**: PapaParse
- **AI** (opsional): Groq API (Llama 3.3 70B)

## License

GPL-3.0
