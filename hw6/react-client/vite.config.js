import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products': 'http://127.0.0.1:8000',
      '/team-members': 'http://127.0.0.1:8000',
      '/case-studies': 'http://127.0.0.1:8000',
      '/login': 'http://127.0.0.1:8000',
      '/logout': 'http://127.0.0.1:8000',
      '/me': 'http://127.0.0.1:8000',
    },
  },
})