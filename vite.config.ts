import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // expose on local network so your phone can reach it
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',  // forward /api/* to Express backend
    },
  },
})
