import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTema } from '../lib/theme'
import { useStore } from '../lib/store'
import { TombolIkon } from './ui'
import {
  IconMatahari, IconBulan, IconKembali, IconProfil, IconKeranjang,
  IconTutup, IconCari, IconTentang, IconTanya, IconDokumen, IconPerisai,
  IconBintang, IconBuku, IconLabel, IconWhatsapp, IconPesanan, IconGear,
  IconHati, IconKeluar, IconToko,
} from './Icons'

// Judul halaman memakai istilah Indonesia sehari-hari.
// Dipakai pada bilah judul versi ponsel (layar kecil), tempat
// navigasi lengkap tidak muat dan hanya judul + tombol kembali
// yang ditampilkan.
const JUDUL = {
  '/': null,
  '/toko': 'Toko Obat',
  '/keranjang': 'Keranjang',
  '/checkout': 'Selesaikan Pesanan',
  '/pesanan': 'Pesanan Saya',
  '/profil': 'Profil Saya',
  '/profil/edit': 'Ubah Profil',
  '/tentang': 'Tentang Kami',
  '/kontak': 'Kontak Kami',
  '/faq': 'Pertanyaan Umum',
  '/syarat': 'Syarat & Ketentuan',
  '/privasi': 'Kebijakan Privasi',
  '/testimoni': 'Testimoni Pelanggan',
  '/blog': 'Berita & Artikel',
  '/promo': 'Promo & Diskon',
  '/wishlist': 'Produk Favorit',
  '/pengaturan': 'Pengaturan Akun',
  '/pengaturan/pengiriman': 'Pengaturan Pengiriman',
}

// Menu navigasi utama versi web (ditampilkan di layar >= 1024px).
const MENU_UTAMA = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/toko', label: 'Toko Obat' },
  { to: '/promo', label: 'Promo' },
  { to: '/blog', label: 'Artikel' },
  { to: '/tentang', label: 'Tentang' },
  { to: '/kontak', label: 'Kontak' },
]

// Tautan sekunder, dikumpulkan di laci menu (ponsel) dan di
// menu akun. Isinya halaman informasi + halaman pelanggan.
const MENU_INFO = [
  { to: '/tentang', label: 'Tentang Kami', Ikon: IconTentang },
  { to: '/kontak', label: 'Kontak Kami', Ikon: IconWhatsapp },
  { to: '/faq', label: 'Pertanyaan Umum', Ikon: IconTanya },
  { to: '/promo', label: 'Promo & Diskon', Ikon: IconLabel },
  { to: '/blog', label: 'Berita & Artikel', Ikon: IconBuku },
  { to: '/testimoni', label: 'Testimoni', Ikon: IconBintang },
  { to: '/syarat', label: 'Syarat & Ketentuan', Ikon: IconDokumen },
  { to: '/privasi', label: 'Kebijakan Privasi', Ikon: IconPerisai },
]

const MENU_AKUN = [
  { to: '/profil', label: 'Profil Saya', Ikon: IconProfil },
  { to: '/pesanan', label: 'Pesanan Saya', Ikon: IconPesanan },
  { to: '/wishlist', label: 'Produk Favorit', Ikon: IconHati },
  { to: '/pengaturan', label: 'Pengaturan Akun', Ikon: IconGear },
  { to: '/pengaturan/pengiriman', label: 'Pengaturan Pengiriman', Ikon: IconToko },
]

export default function Header() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { gelap, toggleTema } = useTema()
  const { user, jumlahKeranjang, logout, beriToast } = useStore()

  const [laci, setLaci] = useState(false) // laci menu ponsel
  const [menuAkun, setMenuAkun] = useState(false)
  const [cari, setCari] = useState('')

  const judul =
    JUDUL[pathname] ??
    (pathname.startsWith('/produk/')
      ? 'Detail Produk'
      : pathname.startsWith('/blog/')
        ? 'Artikel'
        : /^\/pesanan\/.+\/bayar$/.test(pathname)
          ? 'Pembayaran'
          : '')
  const beranda = pathname === '/'

  const kirimCari = (e) => {
    e.preventDefault()
    const q = cari.trim()
    nav(q ? `/toko?q=${encodeURIComponent(q)}` : '/toko')
    setLaci(false)
  }

  const keluar = async () => {
    try {
      await logout()
      beriToast('Anda sudah keluar.', 'info')
      nav('/')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
    setMenuAkun(false)
  }

  return (
    <>
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-hairline bg-[var(--surface-canvas)]/92 backdrop-blur-md">
        {/* --- Baris utama --- */}
        <div className="wadah flex h-16 items-center gap-3">
          {/* Ponsel: tombol kembali / judul halaman */}
          <div className="flex min-w-0 flex-1 items-center gap-1 lg:hidden">
            {!beranda && (
              <TombolIkon label="Kembali" onClick={() => nav(-1)} className="-ml-2">
                <IconKembali size={22} weight="bold" />
              </TombolIkon>
            )}
            {beranda ? (
              <Link to="/" className="flex min-w-0 items-center gap-2.5">
                <Merek />
              </Link>
            ) : (
              <h1 className="min-w-0 flex-1 truncate text-[19px] font-bold tracking-tight text-primary">
                {judul}
              </h1>
            )}
          </div>

          {/* Layar besar: merek + navigasi utama */}
          <Link to="/" className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <Merek />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden lg:flex lg:items-center lg:gap-1">
            {MENU_UTAMA.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.end}
                className={({ isActive }) =>
                  `rounded-[var(--radius-control)] px-3.5 py-2 text-[16px] font-semibold transition-colors ${
                    isActive ? 'bg-accent-soft text-accent' : 'text-secondary hover:surface-hover hover:text-primary'
                  }`
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>

          {/* Pencarian cepat (layar besar) */}
          <form onSubmit={kirimCari} className="ml-auto hidden min-w-0 max-w-[300px] flex-1 lg:block">
            <label className="relative flex items-center">
              <span className="sr-only">Cari obat</span>
              <IconCari size={18} weight="bold" className="pointer-events-none absolute left-3 text-muted" />
              <input
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari obat atau vitamin..."
                className="h-11 w-full rounded-full border border-hairline surface-raised pl-10 pr-3 text-[16px] text-primary placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              />
            </label>
          </form>

          {/* --- Aksi kanan --- */}
          <div className="flex shrink-0 items-center gap-1 lg:ml-0 ml-auto">
            <TombolIkon label={gelap ? 'Mode terang' : 'Mode gelap'} onClick={toggleTema}>
              {gelap ? <IconMatahari size={21} weight="bold" /> : <IconBulan size={21} weight="bold" />}
            </TombolIkon>

            {/* Keranjang: selalu terlihat, dengan lencana jumlah */}
            <button
              type="button"
              onClick={() => nav('/keranjang')}
              aria-label={jumlahKeranjang > 0 ? `Keranjang, ${jumlahKeranjang} barang` : 'Keranjang'}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-secondary hover:surface-hover hover:text-primary"
            >
              <IconKeranjang size={22} weight="bold" />
              {jumlahKeranjang > 0 && (
                <span className="numeric absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-signal-rose-solid)] px-1 text-[12px] font-bold text-white">
                  {jumlahKeranjang > 9 ? '9+' : jumlahKeranjang}
                </span>
              )}
            </button>

            {/* Akun: menu tarik-turun di layar besar, tombol Masuk bila tamu */}
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setMenuAkun((v) => !v)}
                  aria-expanded={menuAkun}
                  aria-haspopup="menu"
                  className="flex h-11 items-center gap-2 rounded-full border border-hairline surface-raised pl-1.5 pr-3 text-[16px] font-semibold text-primary hover:surface-hover"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[14px] font-bold text-accent">
                    {(user.name || 'P').slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">{(user.name || '').split(' ')[0]}</span>
                </button>

                {menuAkun && (
                  <>
                    <button
                      type="button"
                      aria-label="Tutup menu"
                      onClick={() => setMenuAkun(false)}
                      className="fixed inset-0 z-[var(--z-overlay)] cursor-default"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-[52px] z-[var(--z-modal)] w-64 overflow-hidden rounded-[var(--radius-card)] border border-hairline surface-raised shadow-lift"
                    >
                      <p className="border-b border-hairline px-4 py-3">
                        <span className="block truncate text-[16px] font-semibold text-primary">{user.name}</span>
                        <span className="block truncate text-[15px] text-secondary">{user.email || user.phone}</span>
                      </p>
                      {MENU_AKUN.map(({ to, label, Ikon }) => (
                        <button
                          key={to}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuAkun(false)
                            nav(to)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[16px] font-medium text-primary hover:surface-hover"
                        >
                          <Ikon size={19} weight="bold" className="shrink-0 text-accent" />
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={keluar}
                        className="flex w-full items-center gap-3 border-t border-hairline px-4 py-3 text-left text-[16px] font-medium text-[var(--color-signal-rose)] hover:surface-hover"
                      >
                        <IconKeluar size={19} weight="bold" className="shrink-0" />
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => nav('/masuk')}
                className="hidden h-11 items-center gap-2 rounded-full bg-accent px-4 text-[16px] font-semibold text-[var(--accent-contrast)] hover:brightness-95 lg:inline-flex"
              >
                <IconProfil size={18} weight="bold" />
                Masuk
              </button>
            )}

            {/* Tombol laci menu (ponsel & tablet) */}
            <button
              type="button"
              onClick={() => setLaci(true)}
              aria-label="Buka menu"
              aria-expanded={laci}
              className="flex h-11 w-11 items-center justify-center rounded-full text-secondary hover:surface-hover hover:text-primary lg:hidden"
            >
              <IconDaftarMenu />
            </button>
          </div>
        </div>
      </header>

      {/* --- Laci menu ponsel --- */}
      {laci && (
        <div className="fixed inset-0 z-[var(--z-modal)] lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setLaci(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-[360px] flex-col overflow-y-auto surface-raised shadow-lift">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3.5">
              <Merek />
              <TombolIkon label="Tutup menu" onClick={() => setLaci(false)}>
                <IconTutup size={22} weight="bold" />
              </TombolIkon>
            </div>

            <form onSubmit={kirimCari} className="border-b border-hairline p-4">
              <label className="relative flex items-center">
                <span className="sr-only">Cari obat</span>
                <IconCari size={18} weight="bold" className="pointer-events-none absolute left-3 text-muted" />
                <input
                  type="search"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="Cari obat atau vitamin..."
                  className="h-12 w-full rounded-full border border-hairline surface-sunken pl-10 pr-3 text-[16px] text-primary placeholder:text-muted"
                />
              </label>
            </form>

            <nav aria-label="Menu utama" className="p-2">
              {MENU_UTAMA.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.end}
                  onClick={() => setLaci(false)}
                  className={({ isActive }) =>
                    `block rounded-[var(--radius-control)] px-4 py-3 text-[17px] font-semibold ${
                      isActive ? 'bg-accent-soft text-accent' : 'text-primary hover:surface-hover'
                    }`
                  }
                >
                  {m.label}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-hairline p-2">
              <p className="px-4 py-2 text-[14px] font-semibold uppercase tracking-wide text-muted">
                Akun Saya
              </p>
              {user ? (
                MENU_AKUN.map(({ to, label, Ikon }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => {
                      setLaci(false)
                      nav(to)
                    }}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-4 py-3 text-left text-[17px] font-medium text-primary hover:surface-hover"
                  >
                    <Ikon size={20} weight="bold" className="shrink-0 text-accent" />
                    {label}
                  </button>
                ))
              ) : (
                <div className="flex gap-2.5 px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLaci(false)
                      nav('/masuk')
                    }}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[var(--radius-control)] bg-accent px-4 text-[16.5px] font-semibold text-[var(--accent-contrast)]"
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLaci(false)
                      nav('/registrasi')
                    }}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[var(--radius-control)] border border-hairline px-4 text-[16.5px] font-semibold text-primary"
                  >
                    Daftar
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-hairline p-2 pb-8">
              <p className="px-4 py-2 text-[14px] font-semibold uppercase tracking-wide text-muted">
                Informasi Apotek
              </p>
              {MENU_INFO.map(({ to, label, Ikon }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => {
                    setLaci(false)
                    nav(to)
                  }}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-4 py-3 text-left text-[16.5px] font-medium text-secondary hover:surface-hover"
                >
                  <Ikon size={19} weight="bold" className="shrink-0 text-accent" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Ikon garis-tiga untuk tombol menu (dibuat lokal karena ukurannya
// spesifik dan tidak dipakai di tempat lain).
function IconDaftarMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

// Merek apotek: lambang + nama. Dipakai di header dan laci menu.
function Merek() {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-[var(--accent-contrast)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12h4l2-5 3 10 2-5h7" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[17.5px] font-bold leading-tight tracking-tight text-primary">
          Apotek Premysis
        </span>
        <span className="block truncate text-[14px] leading-tight text-secondary">
          Obat &amp; kebutuhan kesehatan
        </span>
      </span>
    </span>
  )
}
