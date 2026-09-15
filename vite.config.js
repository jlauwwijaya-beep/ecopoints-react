import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://139.190.96.203:8092',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://139.190.96.203:8092',
        changeOrigin: true,
      },
    },
  },
})
