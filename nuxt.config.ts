import { fileURLToPath } from 'node:url'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    'nuxt-auth-utils',
  ],

  alias: {
    '#auth-utils/google': fileURLToPath(new URL('./node_modules/nuxt-auth-utils/dist/runtime/server/lib/oauth/google.js', import.meta.url)),
    '#auth-utils/session': fileURLToPath(new URL('./node_modules/nuxt-auth-utils/dist/runtime/server/utils/session.js', import.meta.url)),
  },

  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
    googleClientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || '',
    groqApiKey: process.env.GROQ_API_KEY || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  app: {
    head: {
      title: 'FocusReport — Turn Your Pomodoro Sessions Into Insights',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Transform your Pomofocus CSV data into beautiful, AI-powered productivity reports in seconds.' },
        { name: 'theme-color', content: '#0a0a0f' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
      ],
    },
  },

  css: ['~~/assets/css/main.css'],
})
