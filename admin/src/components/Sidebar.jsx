import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  IconDashboard, IconProduk, IconStok, IconPesanan, IconPengguna, IconLaporan, IconFilter,
  IconStethoscope, IconClose, IconChevronLeft,
} from './Icons'
import { IconButton } from './ui'

// Struktur menu Dashboard Admin (PRD §22), dikelompokkan supaya
// 11 item tidak menjadi satu daftar datar tanpa makna.
const GRUP = [
  {
    label: 'Ringkasan',
    items: [{ to: '/', label: 'Dashboard', icon: IconDashboard, modul: 'dashboard', end: true }],
  },

  {
    label: 'Toko & stok',
    items: [
      { to: '/produk', label: 'Produk & Obat', icon: IconProduk, modul: 'produk' },
      { to: '/kategori', label: 'Kategori', icon: IconFilter, modul: 'produk' },
      { to: '/stok', label: 'Stok', icon: IconStok, modul: 'stok' },
      { to: '/pesanan', label: 'Pesanan', icon: IconPesanan, modul: 'pesanan' },
      { to: '/pengembalian', label: 'Pengembalian', icon: IconPesanan, modul: 'pesanan' },
      { to: '/promo', label: 'Promo & Diskon', icon: IconFilter, modul: 'produk' },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { to: '/pengguna', label: 'Pengguna', icon: IconPengguna, modul: 'pengguna' },
      { to: '/laporan', label: 'Laporan', icon: IconLaporan, modul: 'laporan' },
      { to: '/budget', label: 'Budget & RAB', icon: IconLaporan, modul: 'laporan' },
    ],
  },
]

export default function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const { can, user } = useAuth()

  // RBAC: hanya tampilkan grup yang masih punya item boleh-akses.
  const grup = GRUP.map((g) => ({ ...g, items: g.items.filter((m) => can(m.modul)) })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <>
      {/* Latar gelap untuk panel mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-[rgb(9_14_17/0.45)] lg:hidden"
          style={{ zIndex: 'var(--z-overlay)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 flex w-[252px] flex-col border-r border-hairline surface-sidebar transition-[width,transform] duration-300 ease-[var(--ease-in-out-soft)] ${
          collapsed ? 'lg:w-[68px]' : 'lg:w-[252px]'
        } ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ zIndex: 'var(--z-overlay)' }}
      >
        {/* Merek */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-hairline px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-[var(--accent-contrast)]">
            <IconStethoscope size={19} />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold leading-tight tracking-tight text-primary">
                Premysis Medika
              </p>
              <p className="truncate text-[11.5px] text-muted">Dashboard admin</p>
            </div>
          )}
          <IconButton label="Tutup menu" onClick={onClose} className="lg:hidden">
            <IconClose size={18} />
          </IconButton>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {grup.map((g, gi) => (
            <div key={g.label} className={gi > 0 ? 'mt-5' : ''}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted">
                  {g.label}
                </p>
              )}
              {collapsed && gi > 0 && <div className="mx-2.5 mb-2 border-t border-hairline" />}
              <ul className="space-y-0.5">
                {g.items.map((m) => {
                  const Icon = m.icon
                  return (
                    <li key={m.to}>
                      <NavLink
                        to={m.to}
                        end={m.end}
                        onClick={onClose}
                        title={collapsed ? m.label : undefined}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-[13.5px] transition-colors duration-200 ${
                            isActive
                              ? 'bg-accent-soft font-medium text-accent'
                              : 'text-secondary hover:surface-hover hover:text-primary'
                          } ${collapsed ? 'lg:justify-center' : ''}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Penanda halaman aktif: batang tipis, bukan latar penuh. */}
                            <span
                              aria-hidden="true"
                              className={`absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-200 ${
                                isActive ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            <Icon size={19} weight={isActive ? 'fill' : 'regular'} />
                            {!collapsed && <span className="truncate">{m.label}</span>}
                          </>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Kaki panel: identitas peran + tombol lipat (desktop) */}
        <div className="shrink-0 border-t border-hairline p-2.5">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2.5 rounded-[var(--radius-control)] surface-sunken px-2.5 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full surface-raised text-[12px] font-semibold text-accent">
                {user?.nama?.charAt(0) ?? '-'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-primary">{user?.nama}</p>
                <p className="truncate text-[11px] text-muted">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Bentangkan menu' : 'Lipat menu'}
            title={collapsed ? 'Bentangkan menu' : 'Lipat menu'}
            className={`hidden w-full items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-[13px] text-secondary transition-colors duration-200 hover:surface-hover hover:text-primary lg:flex ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <IconChevronLeft
              size={18}
              className={`transition-transform duration-300 ease-[var(--ease-in-out-soft)] ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Lipat menu</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
