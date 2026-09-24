import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ThemeProvider } from './lib/theme'
import { StoreProvider } from './lib/store'
import { ambilTokenDariUrl } from './lib/api'

// Tangani kembalian dari login Google SEBELUM aplikasi dirender:
// token sudah masuk localStorage, dan pesan galat (bila ada)
// disimpan supaya halaman Masuk bisa menampilkannya sekali.
const hasilGoogle = ambilTokenDariUrl()
if (hasilGoogle?.galat) {
  window.sessionStorage.setItem('premysis_google_error', hasilGoogle.galat)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>,
)
