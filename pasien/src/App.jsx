import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './lib/store'
import AppLayout from './components/AppLayout'
import LayoutPublik from './components/LayoutPublik'
import Masuk from './pages/Masuk'
import Registrasi from './pages/Registrasi'
import Beranda from './pages/Beranda'
import Toko from './pages/Toko'
import DetailProduk from './pages/DetailProduk'
import Keranjang from './pages/Keranjang'
import Checkout from './pages/Checkout'
import Pembayaran from './pages/Pembayaran'
import Pesanan from './pages/Pesanan'
import Profil from './pages/Profil'
import EditProfil from './pages/EditProfil'
import TentangKami from './pages/TentangKami'
import Kontak from './pages/Kontak'
import FAQ from './pages/FAQ'
import HalamanLegal from './pages/HalamanLegal'
import Testimoni from './pages/Testimoni'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Promo from './pages/Promo'
import Wishlist from './pages/Wishlist'
import PengaturanAkun from './pages/PengaturanAkun'
import PengaturanPengiriman from './pages/PengaturanPengiriman'
import TidakDitemukan from './pages/TidakDitemukan'

// Semua halaman kecuali masuk/registrasi memerlukan sesi pelanggan.
function Terlindungi({ children }) {
  const { user } = useStore()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/masuk" state={{ dari: pathname }} replace />
  return children
}

export default function App() {
  const { memuat, galatMuat, muat } = useStore()

  if (memuat) {
    return (
      <div className="flex min-h-dvh items-center justify-center surface-canvas">
        <p className="text-[15.5px] text-muted">Memuat katalog apotek...</p>
      </div>
    )
  }

  // Server API belum jalan: beri pesan yang bisa ditindaklanjuti,
  // bukan layar putih.
  if (galatMuat) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 surface-canvas">
        <div className="w-full max-w-[420px] surface-raised rounded-[var(--radius-card)] border border-hairline p-6 text-center">
          <h1 className="text-[18.5px] font-semibold tracking-tight text-primary">Server apotek belum aktif</h1>
          <p className="mt-2 text-[15.5px] leading-relaxed text-secondary">{galatMuat}</p>
          <p className="mt-3 rounded-[var(--radius-control)] surface-sunken px-3 py-2 text-left text-[15px] text-secondary">
            <code className="numeric">php artisan serve</code>
          </p>
          <button
            type="button"
            onClick={muat}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] bg-accent px-5 text-[16px] font-medium text-[var(--accent-contrast)]"
          >
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/masuk" element={<Masuk />} />
      <Route path="/registrasi" element={<Registrasi />} />

      {/* --- Halaman publik: katalog & informasi apotek --- */}
      <Route element={<LayoutPublik />}>
        <Route index element={<Beranda />} />
        <Route path="toko" element={<Toko />} />
        <Route path="produk/:slug" element={<DetailProduk />} />
        <Route path="tentang" element={<TentangKami />} />
        <Route path="kontak" element={<Kontak />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="syarat" element={<HalamanLegal jenis="terms" />} />
        <Route path="privasi" element={<HalamanLegal jenis="privacy" />} />
        <Route path="testimoni" element={<Testimoni />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="promo" element={<Promo />} />
      </Route>

      {/* --- Halaman pelanggan: perlu masuk --- */}
      <Route element={<Terlindungi><AppLayout /></Terlindungi>}>
        <Route path="keranjang" element={<Keranjang />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="pesanan" element={<Pesanan />} />
        <Route path="pesanan/:nomor/bayar" element={<Pembayaran />} />
        <Route path="profil" element={<Profil />} />
        <Route path="profil/edit" element={<EditProfil />} />

        {/* Halaman akun */}
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="pengaturan" element={<PengaturanAkun />} />
        <Route path="pengaturan/pengiriman" element={<PengaturanPengiriman />} />
      </Route>

      <Route path="*" element={<TidakDitemukan />} />
    </Routes>
  )
}
