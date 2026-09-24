import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'
import {
  IconBeranda, IconToko, IconKeranjang, IconPesanan, IconProfil,
} from './Icons'

// Navigasi utama aplikasi pasien.
//
// Tepat LIMA menu, semuanya e-commerce: Beranda, Toko, Keranjang,
// Pesanan, Profil. Setiap menu WAJIB punya ikon + label teks supaya
// mudah dikenali pengguna lansia.
const MENU = [
  { to: '/', label: 'Beranda', Ikon: IconBeranda, end: true },
  { to: '/toko', label: 'Toko', Ikon: IconToko },
  { to: '/keranjang', label: 'Keranjang', Ikon: IconKeranjang },
  { to: '/pesanan', label: 'Pesanan', Ikon: IconPesanan },
  { to: '/profil', label: 'Profil', Ikon: IconProfil },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const { jumlahKeranjang } = useStore()

  // Sembunyikan saat checkout: pengguna harus fokus menyelesaikan
  // pesanan tanpa tergoda berpindah halaman.
  // Juga disembunyikan di layar besar (>= 1024px): di sana navigasi
  // sudah tersedia di header, jadi menu bawah akan tampil ganda.
  if (pathname === '/checkout') return null

  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-hairline bg-[var(--surface-sidebar)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-[640px] items-stretch px-1 pb-[env(safe-area-inset-bottom)]">
        {MENU.map(({ to, label, Ikon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[14px] transition-colors duration-150 ${
                  isActive ? 'font-bold text-accent' : 'font-medium text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Ikon size={24} weight={isActive ? 'fill' : 'regular'} />
                    {to === '/keranjang' && jumlahKeranjang > 0 && (
                      <span className="absolute -right-2.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-signal-rose-solid)] px-1 text-[12px] font-bold text-white">
                        {jumlahKeranjang > 9 ? '9+' : jumlahKeranjang}
                      </span>
                    )}
                  </span>
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
