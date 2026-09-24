// =============================================================
// Bagian-bagian landing page bergaya referensi "Live Oak Pharmacy".
//
// Semua warna memakai token aplikasi (surface-*, text-*, accent)
// sehingga mode gelap ikut menyesuaikan. Judul memakai Playfair
// Display lewat aturan :where(.publik) di index.css.
//
// Dipakai oleh Beranda.jsx (dan halaman publik lain bila perlu).
// =============================================================
import { IconCentangBulat, IconPanahKanan } from './Icons'

// -------------------------------------------------------------
// Lencana pil dengan titik berdenyut (hero referensi).
// -------------------------------------------------------------
export function LencanaPil({ children, dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-hairline surface-raised px-3.5 py-1.5 text-[14px] font-medium text-secondary shadow-soft ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
        </span>
      )}
      {children}
    </span>
  )
}

// -------------------------------------------------------------
// Judul bagian: label kecil huruf besar + judul serif + pengantar.
// -------------------------------------------------------------
export function JudulBagian({ label, judul, pengantar, tengah = false, aksi, className = '' }) {
  return (
    <div className={`${tengah ? 'mx-auto max-w-[46rem] text-center' : 'max-w-[46rem]'} ${className}`}>
      {label && (
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">{label}</p>
      )}
      <h2 className="mt-3 text-[28px] font-medium leading-[1.15] tracking-tight text-heading sm:text-[34px]">
        {judul}
      </h2>
      {pengantar && (
        <p className={`mt-4 text-[16.5px] leading-relaxed text-secondary ${tengah ? 'mx-auto' : ''}`}>
          {pengantar}
        </p>
      )}
      {aksi && <div className="mt-6">{aksi}</div>}
    </div>
  )
}

// -------------------------------------------------------------
// Kartu "kenapa kami" (3 kolom): wadah ikon putih membulat yang
// membesar saat kartu disorot.
// -------------------------------------------------------------
export function KartuFitur({ Ikon, judul, ket }) {
  return (
    <div className="group reveal rounded-[var(--radius-card)] border border-hairline surface-raised p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-accent transition-transform duration-300 group-hover:scale-110">
        <Ikon size={24} weight="bold" />
      </span>
      <h3 className="mt-5 text-[19px] font-semibold leading-snug text-heading">{judul}</h3>
      <p className="mt-2 text-[15.5px] leading-relaxed text-secondary">{ket}</p>
    </div>
  )
}

// -------------------------------------------------------------
// Kartu kotak info (grid 6 kolom): ikon bulat emerald, naik saat
// disorot.
// -------------------------------------------------------------
export function KartuInfo({ Ikon, judul, ket }) {
  return (
    <div className="reveal rounded-[var(--radius-card)] border border-hairline surface-raised p-5 transition-transform duration-300 hover:-translate-y-1">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
        <Ikon size={22} weight="bold" />
      </span>
      <p className="mt-4 text-[16.5px] font-semibold leading-snug text-heading">{judul}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-secondary">{ket}</p>
    </div>
  )
}

// -------------------------------------------------------------
// Pil layanan (awan tag) - disorot saat kursor di atasnya.
// -------------------------------------------------------------
export function PilLayanan({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-hairline surface-raised px-4 py-2 text-[15.5px] font-medium text-secondary transition-colors hover:bg-[var(--accent-soft)] hover:text-accent"
    >
      {children}
    </button>
  )
}

// -------------------------------------------------------------
// Baris centang kecil (daftar keunggulan / trust bar).
// -------------------------------------------------------------
export function BarisCentang({ children, Ikon = IconCentangBulat, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[15px] text-secondary ${className}`}>
      <Ikon size={17} weight="bold" className="shrink-0 text-accent" />
      {children}
    </span>
  )
}

// Tautan dengan panah, gaya referensi.
export function TautanPanah({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-[16px] font-semibold text-accent"
    >
      {children}
      <IconPanahKanan
        size={18}
        weight="bold"
        className="transition-transform duration-200 group-hover:translate-x-1"
      />
    </button>
  )
}
