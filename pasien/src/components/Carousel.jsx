import { useCallback, useEffect, useRef, useState } from 'react'
import { IconPanahKanan, IconPanahKiri } from './Icons'

// =============================================================
// Carousel sorotan untuk beranda.
//
// Dipakai untuk menyorot promo/penawaran utama secara bergantian.
// Aturan yang dijaga:
//   - Bisa dikendalikan keyboard (panah kiri/kanan) dan tombol.
//   - Berhenti berputar otomatis saat kursor di atasnya, saat fokus
//     masuk, dan saat tab tidak aktif - supaya tidak merepotkan.
//   - Menghormati prefers-reduced-motion.
//   - Titik indikator memakai aria-current, bukan warna saja.
//   - Latar tiap slide memakai kelas permukaan-* (token), bukan
//     warna hex, sehingga mode gelap ikut menyesuaikan.
// =============================================================

const JEDA_MS = 6000

export default function Carousel({ slide = [], onAksi, className = '' }) {
  const [indeks, setIndeks] = useState(0)
  const [jeda, setJeda] = useState(false) // true = hentikan putar otomatis
  const areaRef = useRef(null)
  const jumlah = slide.length

  const ke = useCallback(
    (n) => {
      if (jumlah === 0) return
      setIndeks(((n % jumlah) + jumlah) % jumlah)
    },
    [jumlah],
  )

  // Putar otomatis. Dimatikan saat pengguna berinteraksi, saat tab
  // tidak aktif, dan saat pengguna meminta gerak minimal.
  useEffect(() => {
    if (jumlah <= 1 || jeda) return
    const kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (kurangGerak) return

    const t = setInterval(() => setIndeks((i) => (i + 1) % jumlah), JEDA_MS)
    return () => clearInterval(t)
  }, [jumlah, jeda])

  // Jeda saat tab berpindah ke latar belakang.
  useEffect(() => {
    const saatVisibilitas = () => setJeda(document.hidden)
    document.addEventListener('visibilitychange', saatVisibilitas)
    return () => document.removeEventListener('visibilitychange', saatVisibilitas)
  }, [])

  if (jumlah === 0) return null

  const padaTombol = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      ke(indeks - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      ke(indeks + 1)
    }
  }

  const aktif = slide[indeks]

  return (
    <section
      ref={areaRef}
      aria-roledescription="carousel"
      aria-label="Sorotan beranda"
      className={`relative overflow-hidden rounded-[var(--radius-shell)] border border-hairline ${aktif.warna || 'permukaan-sambutan'} ${className}`}
      onMouseEnter={() => setJeda(true)}
      onMouseLeave={() => setJeda(false)}
      onFocusCapture={() => setJeda(true)}
      onBlurCapture={() => setJeda(false)}
      onKeyDown={padaTombol}
      tabIndex={-1}
    >
      {/* Wadah slide: hanya slide aktif yang dirender agar isi
          halaman tidak dibacakan berulang oleh pembaca layar. */}
      <div
        className="relative z-10 grid items-center gap-5 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-9"
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide ${indeks + 1} dari ${jumlah}`}
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[14px] font-bold uppercase tracking-wide text-accent">
            {aktif.label}
          </span>

          <h2 className="mt-3 text-[25px] font-bold leading-tight tracking-tight text-primary sm:text-[31px]">
            {aktif.judul}
          </h2>

          <p className="mt-2.5 max-w-[52ch] text-[16.5px] leading-relaxed text-secondary sm:text-[17.5px]">
            {aktif.isi}
          </p>

          {aktif.aksi && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onAksi?.(aktif)}
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-accent px-6 text-[16.5px] font-semibold text-[var(--accent-contrast)] hover:brightness-95"
              >
                {aktif.aksi}
              </button>
              <button
                type="button"
                onClick={() => onAksi?.({ ...aktif, keToko: true })}
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-hairline surface-raised px-6 text-[16.5px] font-semibold text-primary hover:surface-hover"
              >
                Lihat Katalog
              </button>
            </div>
          )}
        </div>

        {aktif.ilustrasi && (
          <div className="pointer-events-none hidden shrink-0 sm:block" aria-hidden="true">
            {aktif.ilustrasi}
          </div>
        )}
      </div>

      {/* Kendali: hanya tampil bila lebih dari satu slide. */}
      {jumlah > 1 && (
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-hairline px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2" role="tablist" aria-label="Pilih slide">
            {slide.map((s, i) => (
              <button
                key={s.kunci}
                type="button"
                role="tab"
                aria-selected={i === indeks}
                aria-current={i === indeks ? 'true' : undefined}
                aria-label={`Slide ${i + 1}: ${s.judul}`}
                onClick={() => ke(i)}
                className="flex h-11 items-center px-0.5"
              >
                <span
                  className={`block h-2.5 rounded-full transition-all duration-200 ${
                    i === indeks ? 'w-7 bg-accent' : 'w-2.5 bg-[var(--border-strong)]'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => ke(indeks - 1)}
              aria-label="Slide sebelumnya"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline surface-raised text-primary hover:surface-hover"
            >
              <IconPanahKiri size={19} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => ke(indeks + 1)}
              aria-label="Slide berikutnya"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline surface-raised text-primary hover:surface-hover"
            >
              <IconPanahKanan size={19} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
