import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Catan Helper',
        short_name: 'CatanHelper',
        description: 'Randomized Catan Board Generator & Helper',
        theme_color: '#1a365d',
        background_color: '#1a365d',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4422',
        ws: true
      }
    }
  }
})
