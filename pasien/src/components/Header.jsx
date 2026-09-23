import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useTema } from '../lib/theme'
import { TombolIkon } from './ui'
import { IconNotifikasi, IconMatahari, IconBulan, IconKembali } from './Icons'

// Judul halaman memakai istilah Indonesia sehari-hari (brief §23).
// Tidak ada kata "appointment", "checkout", atau "order".
const JUDUL = {
  '/': null,
  '/appointment': 'Janji Temu',
  '/appointment/baru': 'Buat Janji Temu',
  '/appointment/detail': 'Detail Janji Temu',
  '/riwayat': 'Riwayat Berobat',
  '/riwayat/detail': 'Detail Pemeriksaan',
  '/resep': 'Resep Obat',
  '/vaksinasi': 'Imunisasi Anak',
  '/toko': 'Beli Obat',
  '/keranjang': 'Keranjang',
  '/checkout': 'Selesaikan Pesanan',
  '/pesanan': 'Pesanan Saya',
  '/notifikasi': 'Notifikasi',
  '/profil': 'Profil Saya',
  '/profil/edit': 'Ubah Profil',
}

export default function Header() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { belumDibaca } = useStore()
  const { gelap, toggleTema } = useTema()

  const judul =
    JUDUL[pathname] ??
    (pathname.startsWith('/produk/')
      ? 'Detail Produk'
      : /^\/pesanan\/\d+\/bayar$/.test(pathname)
        ? 'Pembayaran'
        : '')
  const beranda = pathname === '/'

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-hairline bg-[var(--surface-canvas)]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[560px] items-center gap-2 px-4">
        {!beranda && (
          <TombolIkon label="Kembali" onClick={() => nav(-1)} className="-ml-2">
            <IconKembali size={22} weight="bold" />
          </TombolIkon>
        )}

        {beranda ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[19.5px] font-bold tracking-tight text-primary">
              Premysis Medika
            </p>
            <p className="truncate text-[15px] text-secondary">Klinik Ibu &amp; Anak</p>
          </div>
        ) : (
          <h1 className="min-w-0 flex-1 truncate text-[20.5px] font-bold tracking-tight text-primary">
            {judul}
          </h1>
        )}

        <TombolIkon label={gelap ? 'Mode terang' : 'Mode gelap'} onClick={toggleTema}>
          {gelap ? <IconMatahari size={21} weight="bold" /> : <IconBulan size={21} weight="bold" />}
        </TombolIkon>

        <TombolIkon label="Notifikasi" onClick={() => nav('/notifikasi')} className="relative">
          <IconNotifikasi size={22} weight="bold" />
          {belumDibaca > 0 && (
            <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-signal-rose-solid)] px-1 text-[15px] font-bold text-white">
              {belumDibaca > 9 ? '9+' : belumDibaca}
            </span>
          )}
        </TombolIkon>
      </div>
    </header>
  )
}
