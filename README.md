# FocusReport

> Upload file CSV Pomofocus, dapatkan laporan produktivitas PDF yang informatif dan siap download. Gratis, tanpa login.

## Fitur

- **Upload CSV** — Drag & drop atau klik untuk upload file CSV dari Pomofocus
- **Auto-detect kolom** — Otomatis mengenali kolom tanggal, durasi, dan proyek
- **Statistik lengkap** — Total waktu, hari aktif, rata-rata per hari, distribusi proyek
- **Grafik visual** — Bar chart durasi per hari dalam PDF
- **AI Insight** — Analisis produktivitas dengan AI (opsional, butuh Groq API key)
- **Download PDF** — Laporan siap download dalam format PDF
- **Panduan Penggunaan** — Modal popup interaktif menjelaskan alur dari Pomofocus sampai PDF

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
- **UI Framework**: DaisyUI 5 + Tailwind CSS 4
- **PDF**: jsPDF + jspdf-autotable
- **CSV Parser**: PapaParse
- **AI** (opsional): Groq API (Llama 3.3 70B)

---

## 🎨 Dokumentasi Tema Warna — "FocusReport"

Tema kustom DaisyUI bernama `focusreport`. Palette bersifat **light** dengan base lavender-warm, aksen ungu, dan pink untuk kesan modern dan professional.

### Color Palette

| Token               | Hex       | Preview                          | Deskripsi                                   |
|----------------------|-----------|----------------------------------|---------------------------------------------|
| `primary`            | `#6C63FF` | 🟪 Indigo/Violet                 | Warna utama brand, digunakan untuk CTA, badge, link, accent utama |
| `primary-content`    | `#FFFFFF` | ⬜ White                          | Teks di atas elemen primary                 |
| `secondary`          | `#F0EDFF` | 🟪 Lavender sangat muda          | Background highlight, area bertekanan ringan |
| `secondary-content`  | `#4A42B0` | 🟪 Indigo tua                    | Teks di atas elemen secondary               |
| `accent`             | `#FF6B8A` | 🩷 Pink coral                    | Aksen untuk elemen menonjol, gradient title  |
| `accent-content`     | `#FFFFFF` | ⬜ White                          | Teks di atas elemen accent                  |
| `neutral`            | `#3D3A50` | ⬛ Charcoal violet               | Elemen gelap, contrast tinggi               |
| `neutral-content`    | `#E8E6F0` | 🟪 Light lavender                | Teks di atas elemen neutral                 |
| `base-100`           | `#FAFAFE` | ⬜ Soft white lavender            | Background utama halaman                    |
| `base-200`           | `#F0EFF5` | ⬜ Light grey lavender            | Background card, input, area sekunder       |
| `base-300`           | `#E4E2ED` | ⬜ Medium grey lavender           | Border, divider, elemen terhalus            |
| `base-content`       | `#2D2B3A` | ⬛ Dark violet-grey              | Teks utama (heading, body)                  |
| `info`               | `#6CB4EE` | 🔵 Soft blue                    | Alert/badge informasi                       |
| `success`            | `#4ADE80` | 🟢 Green                        | Status berhasil, ikon checklist             |
| `warning`            | `#FBBF24` | 🟡 Amber                        | Peringatan, tip                             |
| `error`              | `#FB7185` | 🩷 Soft rose                    | Error state, validasi gagal                 |

### Gradient yang Digunakan

```css
/* Hero title gradient */
background: linear-gradient(to right, #6C63FF, #A855F7, #FF6B8A);
/* → from-primary via-purple-500 to-accent */

/* Modal header gradient */
background: linear-gradient(to right, #6C63FF, #A855F7);
/* → from-primary to-purple-500 */
```

### Opacity Pattern

Teks menggunakan opacity Tailwind untuk hierarki:

| Penggunaan          | Class                     | Contoh             |
|---------------------|---------------------------|--------------------|
| Teks utama          | `text-base-content`       | Heading, body      |
| Teks sekunder       | `text-base-content/60`    | Subtitle, deskripsi|
| Teks tersier        | `text-base-content/50`    | Hint, caption      |
| Teks semu           | `text-base-content/40`    | Placeholder, date  |
| Teks minimal        | `text-base-content/30`    | Footer             |

### Background Ambient

Background halaman menggunakan 3 blob dekoratif yang sangat halus:

```
blob-1: bg-primary/5  (top-right, 500px)  — Subtle purple glow
blob-2: bg-accent/5   (bottom-left, 400px) — Subtle pink glow
blob-3: bg-secondary/30 (center, 350px)    — Centered lavender wash
```

### Bagaimana Mengubah Tema

1. Buka `assets/css/main.css`
2. Edit variabel warna di dalam blok `@theme`
3. Ganti value hex sesuai kebutuhan (misal: `--color-primary: #6C63FF;`)
4. Warna otomatis berlaku ke semua komponen DaisyUI karena DaisyUI 5 membaca variabel CSS Tailwind 4 secara otomatis.

```css
/* assets/css/main.css */
@theme {
  --color-primary: #6C63FF;     /* ← Ganti warna utama */
  --color-accent: #FF6B8A;      /* ← Ganti warna aksen */
  --color-base-100: #FAFAFE;    /* ← Ganti background utama */
  --color-base-content: #2D2B3A; /* ← Ganti warna teks */
  /* ...dll */
}
```

### Referensi DaisyUI

- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [DaisyUI Color Generator](https://daisyui.com/theme-generator/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

## License

GPL-3.0
