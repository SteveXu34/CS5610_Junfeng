import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for the HQE frontend.
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // Forward API requests to the FastAPI backend.
    // React can use relative URLs such as /api/health.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
