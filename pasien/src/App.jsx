import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './lib/store'
import AppLayout from './components/AppLayout'
import Masuk from './pages/Masuk'
import Registrasi from './pages/Registrasi'
import Beranda from './pages/Beranda'
import Appointment from './pages/Appointment'
import AppointmentBaru from './pages/AppointmentBaru'
import AppointmentDetail from './pages/AppointmentDetail'
import Riwayat from './pages/Riwayat'
import RiwayatDetail from './pages/RiwayatDetail'
import Resep from './pages/Resep'
import Vaksinasi from './pages/Vaksinasi'
import Toko from './pages/Toko'
import DetailProduk from './pages/DetailProduk'
import Keranjang from './pages/Keranjang'
import Checkout from './pages/Checkout'
import Pembayaran from './pages/Pembayaran'
import Pesanan from './pages/Pesanan'
import Notifikasi from './pages/Notifikasi'
import Profil from './pages/Profil'
import EditProfil from './pages/EditProfil'
import TidakDitemukan from './pages/TidakDitemukan'

// Semua halaman kecuali masuk/registrasi memerlukan sesi pasien.
function Terlindungi({ children }) {
  const { user } = useStore()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/masuk" state={{ dari: pathname }} replace />
  return children
}

export default function App() {
  const { user, memuat, galatMuat, muat } = useStore()

  if (memuat) {
    return (
      <div className="flex min-h-dvh items-center justify-center surface-canvas">
        <p className="text-[15.5px] text-muted">Memuat data klinik...</p>
      </div>
    )
  }

  // Server API belum jalan: beri pesan yang bisa ditindaklanjuti,
  // bukan layar putih.
  if (galatMuat && !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 surface-canvas">
        <div className="w-full max-w-[420px] surface-raised rounded-[var(--radius-card)] border border-hairline p-6 text-center">
          <h1 className="text-[18.5px] font-semibold tracking-tight text-primary">Server klinik belum aktif</h1>
          <p className="mt-2 text-[15.5px] leading-relaxed text-secondary">{galatMuat}</p>
          <p className="mt-3 rounded-[var(--radius-control)] surface-sunken px-3 py-2 text-left text-[15px] text-secondary">
            <code className="numeric">npm run server</code>
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
      <Route path="/masuk" element={user ? <Navigate to="/" replace /> : <Masuk />} />
      <Route path="/registrasi" element={user ? <Navigate to="/" replace /> : <Registrasi />} />

      <Route element={<Terlindungi><AppLayout /></Terlindungi>}>
        <Route index element={<Beranda />} />
        <Route path="appointment" element={<Appointment />} />
        <Route path="appointment/baru" element={<AppointmentBaru />} />
        <Route path="appointment/detail" element={<AppointmentDetail />} />
        <Route path="appointment/detail/:id" element={<AppointmentDetail />} />
        <Route path="riwayat" element={<Riwayat />} />
        <Route path="riwayat/detail/:id" element={<RiwayatDetail />} />
        <Route path="resep" element={<Resep />} />
        <Route path="vaksinasi" element={<Vaksinasi />} />
        <Route path="toko" element={<Toko />} />
        <Route path="produk/:id" element={<DetailProduk />} />
        <Route path="keranjang" element={<Keranjang />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="pesanan" element={<Pesanan />} />
        <Route path="pesanan/:id/bayar" element={<Pembayaran />} />
        <Route path="notifikasi" element={<Notifikasi />} />
        <Route path="profil" element={<Profil />} />
        <Route path="profil/edit" element={<EditProfil />} />
        <Route path="*" element={<TidakDitemukan />} />
      </Route>
    </Routes>
  )
}
