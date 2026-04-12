# FocusReport 📊
**SaaS Penjana Laporan Produktivitas Otomatis untuk Pengguna Pomofocus.**

FocusReport adalah platform SaaS modern yang membantu pengguna [Pomofocus](https://pomofocus.io/) mengubah data CSV mentah mereka menjadi laporan aktivitas profesional yang indah, lengkap dengan analisis statistik dan insight berbasis AI.

## ✨ Fitur Utama
- **📊 Pemrosesan CSV Cepat**: Unggah file CSV hasil ekspor Pomofocus dan lihat hasilnya secara instan.
- **🖼️ Dashboard Produktivitas**: Ringkasan total waktu, hari aktif, rata-rata harian, dan grafik distribusi mingguan.
- **🤖 AI Insights**: Analisis pola kerja dan saran actionable menggunakan **Groq AI (Llama-3)**.
- **📄 Laporan PDF Profesional**: Unduh laporan dalam format PDF yang dirancang secara profesional (mirip standar korporat).
- **☁️ Cloud Storage Integration**: PDF laporan Anda disimpan secara otomatis di **Supabase Storage**.
- **🔑 Google OAuth**: Login cepat dan aman tanpa perlu mengelola kata sandi.
- **👑 Subscription System**: Model bisnis Freemium (Free vs Pro) yang terintegrasi di tingkat database.

## 🛠️ Stack Teknologi
- **Frontend**: Nuxt 4, Vue.js 3, Vanilla CSS (Premium & Minimalist UI).
- **Backend/Nitro**: Nuxt Server Routes (TypeScript).
- **Database**: PostgreSQL (via Supabase).
- **ORM**: Prisma.
- **Auth**: `nuxt-auth-utils` (Session-based).
- **AI Engine**: Groq SDK (Llama-3.3-70b).
- **PDF Generation**: jsPDF + jspdf-autotable.
- **Storage**: Supabase Storage buckets.

## 🚀 Setup Proyek

### 1. Prasyarat
- Node.js versi terbaru (LTS direkomendasikan).
- Database PostgreSQL (Disarankan menggunakan Supabase).

### 2. Variabel Lingkungan (.env)
Buat file `.env` di direktori akar dan isi dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"
DIRECT_URL="postgresql://user:password@host:port/dbname"

# Nuxt Auth
NUXT_SESSION_PASSWORD="perlu-minimal-32-karakter-acak"

# Google OAuth
NUXT_OAUTH_GOOGLE_CLIENT_ID="your-client-id"
NUXT_OAUTH_GOOGLE_CLIENT_SECRET="your-client-secret"

# AI
GROQ_API_KEY="your-groq-api-key"

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"
```

### 3. Instalasi & Jalankan
```bash
# Instal dependensi
npm install

# Setup database (Prisma)
npx prisma generate
npx prisma db push

# Jalankan mode pengembangan
npm run dev
```

## 📂 Struktur Folder
- `app/pages`: Routing dan logika halaman (Vue).
- `app/components`: Komponen UI yang dapat digunakan kembali.
- `server/api`: Titik akhir Nitro API (CRUD, Generate PDF, Auth).
- `server/utils`: Utility server (Prisma singleton, Storage helper, PDF builder).
- `prisma`: Skema database dan migrasi.
- `public`: Aset statis dan file contoh (CSV/PDF).

## 📄 Lisensi
Proyek ini dilisensikan di bawah **GNU Affero General Public License v3.0 (AGPL-3.0)** - Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

Copyright © 2026 Adib Maros. Seluruh hak cipta dilindungi undang-undang.
