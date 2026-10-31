import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bar Praza',
        short_name: 'Praza',
        display: 'standalone',
        // Relative to the manifest, so the installed app opens in its own folder, also under a path such as GitHub Pages.
        start_url: './',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.*', 'src/test/**', 'src/main.tsx'],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
    },
  },
})
