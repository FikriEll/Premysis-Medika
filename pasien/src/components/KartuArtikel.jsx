import { fmtTanggal } from '../../../shared/format'
import { IconPanahMiring, IconJam } from './Icons'

// =============================================================
// Kartu artikel (gaya referensi "card article").
//
// Struktur mengikuti referensi: gambar sampul dengan lencana di
// atasnya, baris penulis + avatar, baris meta (tanggal & waktu
// baca), judul, lalu baris bawah dengan panah yang bergerak saat
// kartu disorot.
//
// Referensi memakai latar gelap (neutral-900 + aksen lime). Supaya
// tetap satu keluarga dengan situs, warnanya dipetakan ke emerald
// gelap - sama seperti bagian "Layanan digital" di Beranda. Jadi
// kartu ini sengaja tetap gelap di mode terang maupun gelap.
//
// Karena kartunya gelap, warna teks ditulis eksplisit (emerald-50
// dst). Kalau memakai utilitas seperti text-primary, di mode terang
// nilainya nyaris hitam dan tidak terbaca di atas kartu gelap.
// =============================================================

// Foto cadangan bila artikel belum punya gambar sampul sendiri.
// Semua tautan Unsplash ini sudah diverifikasi tersedia (HTTP 200).
const GAMBAR_CADANGAN = [
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
]

// Inisial nama penulis untuk avatar (mis. "Apoteker Bambang, S.Farm" -> "AB").
const inisial = (nama) =>
  (nama || '')
    .replace(/[^A-Za-z\s]/g, ' ')
    .split(/\s+/)
    .filter((k) => k && !/^apoteker$/i.test(k))
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join('') || 'PM'

export default function KartuArtikel({ artikel, indeks = 0, label = 'Kesehatan', onBuka, className = '' }) {
  const gambar = artikel.cover_image || GAMBAR_CADANGAN[indeks % GAMBAR_CADANGAN.length]
  const penulis = artikel.author || 'Apoteker Kami'
  const menit = artikel.read_minutes || 1

  return (
    <article className={`group h-full ${className}`}>
      <button
        type="button"
        onClick={() => onBuka?.(artikel)}
        aria-label={`Baca artikel: ${artikel.title}`}
        className="flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-shell)] border border-emerald-400/15 bg-emerald-950 text-left transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {/* --- Gambar sampul + lencana --- */}
        <span className="relative block h-44 w-full shrink-0 overflow-hidden sm:h-48">
          <img
            src={gambar}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/25 to-transparent" aria-hidden="true" />
          <span className="absolute left-3 top-3 inline-flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-1 text-[12.5px] font-semibold text-emerald-200 backdrop-blur-sm">
              {label}
            </span>
          </span>
        </span>

        {/* --- Isi kartu --- */}
        <span className="flex flex-1 flex-col gap-3 bg-emerald-950 p-5">
          {/* Baris penulis */}
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-[12.5px] font-bold text-emerald-50">
              {inisial(penulis)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14.5px] font-medium text-emerald-50">{penulis}</span>
              <span className="block text-[12.5px] text-emerald-200/70">Apoteker Klinik Premysis Medika</span>
            </span>
          </span>

          {/* Baris meta: tanggal & waktu baca */}
          <span className="flex items-center gap-2 text-[12.5px] text-emerald-200/70">
            <span className="numeric">{fmtTanggal(artikel.published_at)}</span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1">
              <IconJam size={13} />
              {menit} menit baca
            </span>
          </span>

          {/* Judul */}
          <span className="flex-1 text-[18px] font-semibold leading-snug text-emerald-50 transition-colors duration-300 group-hover:text-emerald-300 sm:text-[19.5px]">
            {artikel.title}
          </span>

          {/* Ringkasan singkat */}
          {artikel.excerpt && (
            <span className="line-clamp-2 text-[14.5px] leading-relaxed text-emerald-100/75">
              {artikel.excerpt}
            </span>
          )}

          {/* Baris bawah: ajakan baca + panah */}
          <span className="mt-auto flex items-center justify-between pt-1">
            <span className="text-[14px] font-semibold text-emerald-300">Baca artikel</span>
            <IconPanahMiring
              size={18}
              weight="bold"
              className="text-emerald-400 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </span>
        </span>
      </button>
    </article>
  )
}
