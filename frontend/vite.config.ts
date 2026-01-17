import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/live': 'http://localhost:5000',
      '/scenario': 'http://localhost:5000',
      '/historical': 'http://localhost:5000',
      '/health': 'http://localhost:5000'
    }
  }
})
