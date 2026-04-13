import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [],

  runtimeConfig: {
    groqApiKey: process.env.GROQ_API_KEY || '',
  },

  app: {
    head: {
      title: 'FocusReport — Ubah Data Pomofocus Jadi Laporan PDF',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Upload file CSV Pomofocus, dapatkan laporan produktivitas PDF yang informatif dan siap download. Gratis, tanpa login.' },
        { name: 'theme-color', content: '#FAFAFE' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
      ],
    },
  },

  css: ['~~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss() as any],
    optimizeDeps: {
      include: ['papaparse'],
    },
  },
})
