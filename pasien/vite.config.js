import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// App pasien berjalan di port 5174.
// Semua panggilan /api diteruskan ke server bersama (port 4000) supaya
// data yang dilihat pasien sama dengan yang dilihat admin - PRD N-05.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    open: false,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:4000',
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
          // Peta dipisah dari kode aplikasi DAN dimuat hanya saat
          // halaman Checkout memakainya (React.lazy). Pasien yang
          // memilih "Ambil di Klinik" tidak perlu mengunduh Leaflet
          // sama sekali.
          peta: ['leaflet'],
        },
      },
    },
  },
})
