// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
  runtimeConfig: {
    // Server-only. Override with ADMIN_PASSWORD. Gates the hidden /admin page.
    adminPassword: process.env.ADMIN_PASSWORD || 'changeme'
  },
  app: {
    head: {
      title: 'Syllabus Assistant',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
