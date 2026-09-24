import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import {
  IconWhatsapp, IconTelepon, IconEmail, IconLokasi, IconJam,
  IconTentang, IconTanya, IconDokumen, IconPerisai, IconBintang,
  IconBuku, IconLabel,
} from './Icons'
import LogoKlinik from './LogoKlinik'

// =============================================================
// Footer website.
//
// Pada versi "app mobile" dulu, tautan informasi hanya menumpuk
// di bawah halaman. Sebagai WEBSITE, tautan-tautan itu dipindah
// ke footer tiga kolom yang rapi - pola yang familiar di web -
// sehingga halaman utama tetap ringkas dan navigasi tetap
// lengkap di semua ukuran layar.
// =============================================================

const KOLOM_LAYANAN = [
  { to: '/toko', label: 'Katalog Obat' },
  { to: '/promo', label: 'Promo & Diskon' },
  { to: '/wishlist', label: 'Produk Favorit' },
  { to: '/pesanan', label: 'Lacak Pesanan' },
]

const KOLOM_INFO = [
  { to: '/tentang', label: 'Tentang Kami', Ikon: IconTentang },
  { to: '/faq', label: 'Pertanyaan Umum', Ikon: IconTanya },
  { to: '/blog', label: 'Berita & Artikel', Ikon: IconBuku },
  { to: '/testimoni', label: 'Testimoni', Ikon: IconBintang },
]

const KOLOM_LEGAL = [
  { to: '/syarat', label: 'Syarat & Ketentuan', Ikon: IconDokumen },
  { to: '/privasi', label: 'Kebijakan Privasi', Ikon: IconPerisai },
  { to: '/kontak', label: 'Kontak Kami', Ikon: IconWhatsapp },
]

export default function Footer() {
  const nav = useNavigate()
  const { pengaturan } = useStore()

  const nama = pengaturan?.site_name || 'Klinik Premysis Medika'
  const tagline = pengaturan?.site_tagline || 'Obat lengkap, cepat & terpercaya'
  const telepon = pengaturan?.phone || '0812-1111-2222'
  const whatsapp = (pengaturan?.whatsapp || '6281211112222').replace(/[^0-9]/g, '')
  const email = pengaturan?.email || 'info@apotek.test'
  const alamat = pengaturan?.address || 'Jl. Kesehatan Raya No. 45, Depok, Jawa Barat'
  const jam = pengaturan?.opening_hours || 'Senin - Sabtu: 08.00 - 21.00 WIB'

  return (
    <footer className="mt-14 border-t border-hairline surface-sidebar">
      <div className="wadah py-10">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
          {/* --- Kolom 1: identitas + kontak --- */}
          <div>
            <span className="flex items-center gap-2.5">
              <LogoKlinik size={40} />
              <span className="min-w-0">
                <span className="block text-[18px] font-bold leading-tight tracking-tight text-primary">
                  {nama}
                </span>
                <span className="block text-[14.5px] leading-tight text-secondary">{tagline}</span>
              </span>
            </span>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-secondary">
              Obat asli, vitamin, dan alat kesehatan - diantar cepat sampai rumah Anda.
            </p>

            <ul className="mt-4 space-y-2.5 text-[15.5px] leading-relaxed text-secondary">
              <li className="flex items-start gap-2.5">
                <IconLokasi size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                <span>{alamat}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconTelepon size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                <span className="numeric">{telepon}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconEmail size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                <span className="break-all">{email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconJam size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                <span className="whitespace-pre-line">{jam}</span>
              </li>
            </ul>
          </div>

          {/* --- Kolom 2: layanan --- */}
          <div>
            <p className="text-[16px] font-semibold text-primary">Layanan</p>
            <ul className="mt-3.5 space-y-2.5">
              {KOLOM_LAYANAN.map(({ to, label }) => (
                <li key={to}>
                  <button
                    type="button"
                    onClick={() => nav(to)}
                    className="text-left text-[15.5px] text-secondary hover:text-accent"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Kolom 3: informasi --- */}
          <div>
            <p className="text-[16px] font-semibold text-primary">Informasi</p>
            <ul className="mt-3.5 space-y-2.5">
              {KOLOM_INFO.map(({ to, label }) => (
                <li key={to}>
                  <button
                    type="button"
                    onClick={() => nav(to)}
                    className="text-left text-[15.5px] text-secondary hover:text-accent"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Kolom 4: bantuan --- */}
          <div>
            <p className="text-[16px] font-semibold text-primary">Butuh Bantuan?</p>
            <p className="mt-3 text-[15.5px] leading-relaxed text-secondary">
              Apoteker kami siap membantu memilih obat yang tepat untuk Anda.
            </p>
            <a
              href={`https://wa.me/${whatsapp}?text=Halo%2C%20saya%20ingin%20bertanya%20soal%20obat.`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-signal-green-solid)] px-4 text-[16.5px] font-semibold text-white hover:brightness-95"
            >
              <IconWhatsapp size={20} weight="bold" />
              Chat WhatsApp
            </a>
            <ul className="mt-4 space-y-2.5">
              {KOLOM_LEGAL.map(({ to, label }) => (
                <li key={to}>
                  <button
                    type="button"
                    onClick={() => nav(to)}
                    className="text-left text-[15px] text-muted hover:text-accent"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Baris bawah --- */}
        <div className="mt-9 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] leading-relaxed text-muted">
            © {new Date().getFullYear()} {nama}. Data pada aplikasi ini adalah contoh untuk
            pengembangan.
          </p>
          <p className="flex items-center gap-2 text-[15px] text-muted">
            <IconLabel size={16} className="text-accent" />
            Pembayaran aman lewat Midtrans
          </p>
        </div>
      </div>
    </footer>
  )
}
