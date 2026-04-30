import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isStorybook = process.env.STORYBOOK === 'true'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    !isStorybook && VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BudgetPilot',
        short_name: 'BudgetPilot',
        description: 'Privacy-first personal budget tracker',
        theme_color: '#14b8a6',
        background_color: '#040810',
        display: 'standalone',
        // PWA icons to be supplied by user before build
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
})
