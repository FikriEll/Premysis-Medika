import { NavLink, useLocation } from 'react-router-dom'
import {
  IconBeranda, IconAppointment, IconPesanan, IconProfil,
} from './Icons'

// Navigasi utama aplikasi pasien - brief §5.
//
// Tepat EMPAT menu, tidak lebih: pengguna lansia harus bisa
// menghafal isi aplikasi. Toko obat tidak ditaruh di sini karena
// sudah tersedia sebagai aksi "Beli Obat" di Beranda.
//
// Setiap menu WAJIB punya ikon + label teks. Ikon saja tidak
// dipakai untuk fungsi penting (brief §1 dan §5).
const MENU = [
  { to: '/', label: 'Beranda', Ikon: IconBeranda, end: true },
  { to: '/appointment', label: 'Janji Temu', Ikon: IconAppointment },
  { to: '/pesanan', label: 'Pesanan', Ikon: IconPesanan },
  { to: '/profil', label: 'Profil', Ikon: IconProfil },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  // Sembunyikan saat checkout: pengguna harus fokus menyelesaikan
  // pesanan tanpa tergoda berpindah halaman.
  if (pathname === '/checkout') return null

  return (
    <nav
      aria-label="Menu utama"
      // Latar dibuat PEKAT (tanpa transparansi/blur). Dua alasan:
      // (1) kontras label jadi pasti dan bisa diaudit, (2) tidak ada
      // konten yang "tembus" di belakang menu sehingga membingungkan
      // pengguna lansia saat menggulir.
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-hairline bg-[var(--surface-sidebar)]"
    >
      <ul className="mx-auto flex max-w-[560px] items-stretch px-1 pb-[env(safe-area-inset-bottom)]">
        {MENU.map(({ to, label, Ikon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[15px] transition-colors duration-150 ${
                  isActive ? 'font-bold text-accent' : 'font-medium text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Ikon size={25} weight={isActive ? 'fill' : 'regular'} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
