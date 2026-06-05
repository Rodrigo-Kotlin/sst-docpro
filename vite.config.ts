import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Generates dist/404.html as a copy of dist/index.html so Cloudflare Pages
// can serve it as a SPA fallback (no _redirects rule needed).
function spa404Plugin() {
  return {
    name: 'spa-404',
    closeBundle() {
      const src = resolve(__dirname, 'dist/index.html')
      const dest = resolve(__dirname, 'dist/404.html')
      if (existsSync(src)) copyFileSync(src, dest)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    spa404Plugin(),
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'SST DocPro',
        short_name: 'SST DocPro',
        description: 'Gestão de documentos SST para produções audiovisuais',
        theme_color: '#7e14ff',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'documents',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
