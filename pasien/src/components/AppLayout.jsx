import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { Toast } from './ui'
import { useStore } from '../lib/store'

// =============================================================
// Kerangka halaman pelanggan yang sudah masuk.
//
// Layout WEB: header lengkap (navigasi pindah ke header di layar
// besar), konten selebar `wadah` (1280px), lalu footer tiga kolom.
// Menu bawah (BottomNav) hanya muncul di ponsel/tablet - di layar
// besar navigasi sudah ada di header sehingga tidak perlu ganda.
// =============================================================
export default function AppLayout() {
  const { toast } = useStore()

  return (
    <div className="flex min-h-dvh flex-col surface-canvas">
      <a href="#konten" className="skip-link">
        Lompat ke konten
      </a>
      <Header />
      <main id="konten" className="wadah flex-1 pb-nav pt-5">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <Toast toast={toast} />
    </div>
  )
}
