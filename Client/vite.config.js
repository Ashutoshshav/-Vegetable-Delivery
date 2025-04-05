import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // This is the default. You can specify another directory here if you prefer.
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // your backend URL for development
        changeOrigin: true,
      },
    },
  },
})
