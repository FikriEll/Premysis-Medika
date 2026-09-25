import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: false,
    // Semua /api diteruskan ke SERVER APOTEK (Laravel, port 8000) -
    // server yang sama dengan aplikasi pasien, supaya data yang dilihat
    // admin identik dengan yang dilihat pasien - PRD N-05.
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
