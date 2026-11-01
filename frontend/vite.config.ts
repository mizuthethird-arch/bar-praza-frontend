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
  // In development the browser calls the API through this server (VITE_API_URL=/api), so it works from any
  // address that opens the app, such as a phone over Tailscale. The backend stays on its own port.
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', rewrite: (path) => path.replace(/^\/api/, '') },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.*', 'src/test/**', 'src/main.tsx'],
      thresholds: { statements: 98, branches: 98, functions: 98, lines: 98 },
    },
  },
})
