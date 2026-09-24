import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// App pasien berjalan di port 5174.
// Semua panggilan /api diteruskan ke server apotek (Laravel, port 8000)
// supaya katalog, stok, harga, dan pesanan yang dilihat pelanggan
// selalu sama dengan yang dilihat petugas apotek.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    open: false,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Pisahkan pustaka pihak ketiga dari kode aplikasi.
        // Aplikasi ini dipakai lewat ponsel, sering dengan koneksi
        // lambat; memisahkan vendor membuat perubahan kecil pada kode
        // aplikasi tidak memaksa pasien mengunduh ulang seluruh
        // pustaka (React + router + ikon) setiap kali.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ikon: ['@phosphor-icons/react'],
        },
      },
    },
  },
})
