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

// ---------------------------------------------------------------
// Animasi "reveal" saat elemen masuk layar (referensi Live Oak).
//
// Kelas .js-reveal dipasang HANYA bila JavaScript berjalan. Bila
// skrip mati, kelas itu tidak pernah dipasang sehingga elemen
// .reveal tampil normal - konten tidak boleh hilang karena animasi.
//
// Ada DUA jalur, dan keduanya sengaja dibuat "fail-open":
//   1. IntersectionObserver - jalur utama yang efisien.
//   2. Pemeriksaan saat menggulir (requestAnimationFrame) - jaring
//      pengaman. IntersectionObserver hanya melaporkan KEADAAN
//      TERAKHIR saat callback-nya dijalankan; kalau pengguna
//      menggulir sangat cepat atau melompat (tautan jangkar, tarik
//      bilah gulir), sebuah elemen bisa sudah terlewat dan tidak
//      pernah ditandai aktif. Pemeriksaan ini memastikan apa pun
//      yang sudah melewati atau menyentuh tepi bawah layar selalu
//      ditampilkan.
// ---------------------------------------------------------------
if (typeof window !== 'undefined') {
  document.documentElement.classList.add('js-reveal')

  const tandaiAktif = (el, pengamat) => {
    el.classList.add('active')
    pengamat?.unobserve(el)
  }

  const pengamat =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entri) => {
            entri.forEach((e) => {
              if (e.isIntersecting) tandaiAktif(e.target, pengamat)
            })
          },
          { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        )
      : null

  // Jaring pengaman: tampilkan apa pun yang tepinya sudah menyentuh
  // atau melewati dasar layar.
  const periksaTerlihat = () => {
    const tinggi = window.innerHeight
    document.querySelectorAll('.reveal:not(.active)').forEach((el) => {
      if (el.getBoundingClientRect().top < tinggi) tandaiAktif(el, pengamat)
    })
  }

  const amatiSemua = () => {
    const belum = document.querySelectorAll('.reveal:not(.active)')
    if (pengamat) belum.forEach((el) => pengamat.observe(el))
    periksaTerlihat()
  }

  let rafId = null
  const jadwalkan = () => {
    if (rafId != null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      periksaTerlihat()
    })
  }

  amatiSemua()
  window.addEventListener('scroll', jadwalkan, { passive: true })
  window.addEventListener('resize', jadwalkan, { passive: true })

  // Elemen .reveal muncul belakangan (setelah data server tiba),
  // jadi kita amati ulang setiap kali DOM berubah.
  new MutationObserver(amatiSemua).observe(document.body, { childList: true, subtree: true })
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
