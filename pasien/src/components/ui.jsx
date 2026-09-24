// =============================================================
// Design system aplikasi pasien (brief §25).
//
// Aturan yang dipegang di seluruh berkas ini:
// - Target sentuh minimal 44-48px (brief §22).
// - Body text minimal 15px, caption minimal 13px (brief §4).
// - Satu warna aksi (teal). Status memakai ikon + teks, tidak
//   pernah warna saja (brief §22).
// - Tanpa emoji dekoratif, tanpa em-dash.
// - Semua warna lewat token, jadi mode gelap tidak pernah lupa.
// =============================================================
import { useEffect } from 'react'
import { fmtJam } from '../../../shared/format'
import {
  IconTutup, IconCari, IconCentang, IconCentangBulat, IconPeringatan, IconInfo,
  IconPanahKanan, IconKurang, IconTambah, IconUlang, IconJam,
} from './Icons'

// ---------------------------------------------------------------
// Tombol. Brief §4: teks tombol 16px, dan §22: target 44-48px.
// ---------------------------------------------------------------
const VARIAN = {
  primary: 'bg-accent text-[var(--accent-contrast)] active:brightness-95',
  secondary: 'surface-raised border border-strong text-primary active:surface-hover',
  ghost: 'text-secondary active:surface-hover',
  danger: 'bg-[var(--color-signal-rose-solid)] text-white active:brightness-95',
  sukses: 'bg-[var(--color-signal-green-solid)] text-white active:brightness-95',
}

// `sm` sengaja tetap 44px: batas bawah target sentuh yang aman.
const UKURAN = {
  sm: 'min-h-11 px-4 text-[16px] gap-2',
  md: 'min-h-12 px-4 text-[17px] gap-2',
  lg: 'min-h-14 px-5 text-[18px] gap-2.5',
}

export function Tombol({
  children, variant = 'primary', size = 'md', className = '', type = 'button', penuh, ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-control)] font-semibold transition-[background-color,color,filter,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px ${penuh ? 'w-full' : ''} ${VARIAN[variant]} ${UKURAN[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Tombol ikon bulat. 44px agar tetap nyaman disentuh.
export function TombolIkon({ label, children, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-secondary transition-colors duration-150 active:surface-hover ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------
// Kartu & judul seksi
// ---------------------------------------------------------------
export function Kartu({ children, className = '', padat, ...props }) {
  return (
    <div
      className={`surface-raised rounded-[var(--radius-card)] border border-hairline ${padat ? '' : 'p-4'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function JudulSeksi({ children, aksi, className = '' }) {
  return (
    <div className={`mb-3 flex items-baseline justify-between gap-3 ${className}`}>
      <h2 className="text-[21px] font-semibold tracking-tight text-heading">{children}</h2>
      {aksi}
    </div>
  )
}

// ---------------------------------------------------------------
// Form. Label selalu di atas input, bantuan/galat di bawah.
// ---------------------------------------------------------------
export function Kolom({ label, children, wajib, bantuan, galat, htmlFor }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 flex items-baseline gap-1 text-[16px] font-medium text-secondary">
        {label}
        {wajib && <span className="text-[var(--color-signal-rose)]" aria-hidden="true">*</span>}
      </span>
      {children}
      {galat ? (
        <span className="mt-2 flex items-start gap-1.5 text-[15px] leading-relaxed text-[var(--color-signal-rose)]">
          <IconPeringatan size={15} className="mt-0.5 shrink-0" />
          <span>{galat}</span>
        </span>
      ) : (
        bantuan && <span className="mt-2 block text-[15px] leading-relaxed text-muted">{bantuan}</span>
      )}
    </label>
  )
}

const dasarInput =
  'w-full rounded-[var(--radius-control)] border border-strong bg-[var(--surface-raised)] px-4 text-[17px] text-primary placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-[var(--accent)] focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-60'

export function Input({ className = '', ...props }) {
  return <input className={`${dasarInput} h-12 ${className}`} {...props} />
}

export function Pilih({ children, className = '', ...props }) {
  return (
    <select className={`${dasarInput} h-12 pr-10 ${className}`} {...props}>
      {children}
    </select>
  )
}

export function AreaTeks({ className = '', ...props }) {
  return <textarea className={`${dasarInput} min-h-[104px] resize-y py-3 leading-relaxed ${className}`} {...props} />
}

export function InputCari({ value, onChange, placeholder = 'Cari...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        <IconCari size={20} />
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${dasarInput} h-12 pl-11`}
      />
    </div>
  )
}

// ---------------------------------------------------------------
// Lencana status (brief §22).
// Selalu ikon + teks. Warna saja tidak boleh jadi satu-satunya
// pembawa makna, jadi setiap tone punya ikon bawaannya sendiri.
// ---------------------------------------------------------------
const TONE = {
  neutral: 'bg-[var(--surface-sunken)] text-secondary',
  accent: 'bg-[var(--accent-soft)] text-accent',
  amber: 'bg-[var(--color-signal-amber-soft)] text-[var(--color-signal-amber)]',
  rose: 'bg-[var(--color-signal-rose-soft)] text-[var(--color-signal-rose)]',
  green: 'bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]',
  blue: 'bg-[var(--color-signal-blue-soft)] text-[var(--color-signal-blue)]',
}

const IKON_TONE = {
  neutral: IconInfo,
  accent: IconInfo,
  amber: IconJam,
  rose: IconPeringatan,
  green: IconCentangBulat,
  blue: IconJam,
}

export function Lencana({ children, tone = 'neutral', ikon, className = '' }) {
  const Ikon = ikon ? null : IKON_TONE[tone] || IconInfo
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[15px] font-semibold ${TONE[tone] || TONE.neutral} ${className}`}
    >
      {ikon || (Ikon && <Ikon size={14} weight="bold" />)}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------
// Keadaan kosong (brief §20): ilustrasi + penjelasan + satu tindakan.
// ---------------------------------------------------------------
export function Kosong({ judul = 'Belum ada data', pesan, ikon, ilustrasi, aksi }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {ilustrasi ? (
        <div className="mb-1">{ilustrasi}</div>
      ) : (
        ikon && (
          <span className="flex h-14 w-14 items-center justify-center rounded-full surface-sunken text-muted">
            {ikon}
          </span>
        )
      )}
      <div>
        <p className="text-[18.5px] font-semibold text-primary">{judul}</p>
        {pesan && <p className="mx-auto mt-1.5 max-w-[36ch] text-[16px] leading-relaxed text-secondary">{pesan}</p>}
      </div>
      {aksi}
    </div>
  )
}

// ---------------------------------------------------------------
// Keadaan galat (brief §19): sebutkan masalah + jalan keluarnya.
// ---------------------------------------------------------------
export function Galat({ judul = 'Terjadi masalah', pesan, onCoba, className = '' }) {
  return (
    <div
      role="alert"
      className={`surface-raised rounded-[var(--radius-card)] border border-hairline p-5 text-center ${className}`}
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-signal-rose-soft)] text-[var(--color-signal-rose)]">
        <IconPeringatan size={26} weight="bold" />
      </span>
      <p className="mt-3 text-[18.5px] font-semibold text-primary">{judul}</p>
      {pesan && <p className="mx-auto mt-1.5 max-w-[36ch] text-[16px] leading-relaxed text-secondary">{pesan}</p>}
      {onCoba && (
        <Tombol className="mt-4" onClick={onCoba}>
          <IconUlang size={18} weight="bold" />
          Coba Lagi
        </Tombol>
      )}
    </div>
  )
}

export function Memuat({ baris = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: baris }).map((_, i) => (
        <div key={i} className="surface-raised rounded-[var(--radius-card)] border border-hairline p-4">
          <div className="h-4 w-2/5 animate-pulse rounded-[6px] surface-sunken" />
          <div className="mt-3 h-4 w-3/5 animate-pulse rounded-[6px] surface-sunken" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------
// Baris daftar yang bisa ditekan (navigasi ke detail).
// ---------------------------------------------------------------
export function BarisTautan({ children, onClick, className = '', as: Tag = 'button', ...props }) {
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors duration-150 active:surface-hover ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

// ---------------------------------------------------------------
// Pengatur jumlah (keranjang & detail produk). Tombol 44px.
// ---------------------------------------------------------------
export function PengaturJumlah({ nilai, onKurang, onTambah, min = 1, max = 99, className = '' }) {
  return (
    <div className={`inline-flex items-center rounded-[var(--radius-control)] border border-strong ${className}`}>
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={onKurang}
        disabled={nilai <= min}
        className="flex h-11 w-12 items-center justify-center rounded-l-[var(--radius-control)] text-secondary transition-colors active:surface-hover disabled:opacity-35"
      >
        <IconKurang size={18} weight="bold" />
      </button>
      <span className="numeric w-11 text-center text-[17px] font-semibold text-primary" aria-live="polite">
        {nilai}
      </span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={onTambah}
        disabled={nilai >= max}
        className="flex h-11 w-12 items-center justify-center rounded-r-[var(--radius-control)] text-secondary transition-colors active:surface-hover disabled:opacity-35"
      >
        <IconTambah size={18} weight="bold" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------
// Lembar bawah (bottom sheet): pola input di mobile, lebih nyaman
// daripada modal di tengah layar.
// ---------------------------------------------------------------
export function Lembar({ buka, onTutup, judul, subjudul, children, footer }) {
  useEffect(() => {
    if (!buka) return
    const asli = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const tekan = (e) => {
      if (e.key === 'Escape') onTutup?.()
    }
    document.addEventListener('keydown', tekan)
    return () => {
      document.body.style.overflow = asli
      document.removeEventListener('keydown', tekan)
    }
  }, [buka, onTutup])

  if (!buka) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onTutup}
        className="absolute inset-0 bg-[rgb(9_16_18/0.55)] backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className="relative flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[var(--radius-shell)] border border-hairline surface-raised shadow-lift animate-[pm-naik_240ms_var(--ease-out-soft)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-hairline px-5 pb-4 pt-4">
          <div className="min-w-0">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full surface-sunken" />
            <h2 className="text-[20.5px] font-semibold tracking-tight text-primary">{judul}</h2>
            {subjudul && <p className="mt-1 text-[16px] text-secondary">{subjudul}</p>}
          </div>
          <TombolIkon label="Tutup" onClick={onTutup}>
            <IconTutup size={20} />
          </TombolIkon>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="border-t border-hairline px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// Dialog konfirmasi (brief §21).
// Label tombol MENYEBUT TINDAKANNYA ("Ya, Batalkan"), bukan "OK"
// yang tidak menjelaskan apa yang akan terjadi. Tombol batal
// ditempatkan di bawah supaya jari tidak salah tekan.
// ---------------------------------------------------------------
export function Konfirmasi({
  buka, onTutup, onYa, judul, pesan, labelYa = 'Ya, lanjutkan',
  labelTidak = 'Tidak, Kembali', tone = 'danger', sibuk,
}) {
  return (
    <Lembar
      buka={buka}
      onTutup={onTutup}
      judul={judul}
      footer={
        <div className="space-y-2.5">
          <Tombol variant={tone === 'danger' ? 'danger' : 'primary'} size="lg" penuh onClick={onYa} disabled={sibuk}>
            {sibuk ? 'Memproses...' : labelYa}
          </Tombol>
          <Tombol variant="secondary" size="lg" penuh onClick={onTutup} disabled={sibuk}>
            {labelTidak}
          </Tombol>
        </div>
      }
    >
      <p className="text-[17px] leading-relaxed text-secondary">{pesan}</p>
    </Lembar>
  )
}

// ---------------------------------------------------------------
// Toast: umpan balik singkat setelah aksi (brief §28).
// ---------------------------------------------------------------
export function Toast({ toast }) {
  if (!toast) return null
  const ikon = {
    sukses: <IconCentang size={19} weight="bold" />,
    galat: <IconPeringatan size={19} weight="bold" />,
    info: <IconInfo size={19} weight="bold" />,
  }[toast.tone] || <IconInfo size={19} weight="bold" />

  const warna = {
    sukses: 'bg-[var(--color-signal-green-solid)] text-white',
    galat: 'bg-[var(--color-signal-rose-solid)] text-white',
    info: 'bg-[var(--color-ink-900)] text-[var(--color-ink-50)]',
  }[toast.tone] || 'bg-[var(--color-ink-900)] text-[var(--color-ink-50)]'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[var(--z-toast)] flex justify-center px-4">
      <div
        role="status"
        className={`flex max-w-[560px] items-center gap-2.5 rounded-[var(--radius-control)] px-4 py-3 text-[16px] font-medium shadow-lift ${warna}`}
      >
        {ikon}
        <span className="min-w-0">{toast.pesan}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// Baris info berlabel (dipakai di detail pesanan, profil, dll).
// ---------------------------------------------------------------
export function BarisInfo({ label, children, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${className}`}>
      <span className="shrink-0 text-[16px] text-secondary">{label}</span>
      <span className="min-w-0 text-right text-[16px] font-medium text-primary">{children}</span>
    </div>
  )
}

// Tautan "lihat semua" dengan panah.
export function TautanLanjut({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1 text-[16px] font-semibold text-accent active:opacity-70"
    >
      {children}
      <IconPanahKanan size={15} weight="bold" />
    </button>
  )
}

// ---------------------------------------------------------------
// Avatar pasien (brief §25 PatientAvatar).
// Inisial pada lingkaran teal; tidak memakai foto palsu.
// ---------------------------------------------------------------
export function AvatarPasien({ nama, size = 56, className = '' }) {
  const inisial = (nama || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() || '')
    .join('')
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-[var(--accent-contrast)] ${className}`}
    >
      {inisial}
    </span>
  )
}

// ---------------------------------------------------------------
// Kartu tindakan besar (brief §7 akses cepat, §8 langkah 1).
// Ikon + teks + panah; seluruh kartu bisa ditekan.
//
// `warna` (opsional) memberi tile warna berbeda per pintasan supaya
// mudah dibedakan sekilas. Nilainya nama utility permukaan-<hue>;
// teks judul tetap text-primary (bukan warna hue) agar tetap lolos
// kontras dan konsisten. Warna BUKAN satu-satunya penanda - tiap
// tile selalu punya label teks (brief §22).
// ---------------------------------------------------------------
export function KartuAksi({ Ikon, judul, ket, onClick, warna = 'permukaan-1', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[64px] w-full items-center gap-4 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-4 text-left transition-colors active:surface-hover ${className}`}
    >
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${warna}`}>
        <Ikon size={27} weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[18.5px] font-bold leading-snug text-primary">{judul}</span>
        {ket && <span className="mt-1 block text-[16px] leading-snug text-secondary">{ket}</span>}
      </span>
      <IconPanahKanan size={20} weight="bold" className="shrink-0 text-muted" />
    </button>
  )
}

// ---------------------------------------------------------------
// Kepala halaman konten (Tentang, Kontak, FAQ, dan seterusnya).
//
// Satu pola untuk semua halaman statis: ilustrasi di kanan, judul
// dan pengantar di kiri, dalam satu kartu tint rata (bukan
// gradient, sesuai brief). Ilustrasi bersifat dekoratif karena
// judulnya sudah menyampaikan makna yang sama.
// ---------------------------------------------------------------
export function KepalaHalaman({ judul, pengantar, ilustrasi, aksi, className = '' }) {
  return (
    <section className={`permukaan-sambutan overflow-hidden rounded-[var(--radius-shell)] border border-hairline ${className}`}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 px-5 py-5">
          <h1 className="text-[25px] font-semibold leading-snug tracking-tight text-heading">{judul}</h1>
          {pengantar && (
            <p className="mt-2 max-w-[34ch] text-[16px] leading-relaxed text-secondary">{pengantar}</p>
          )}
          {aksi && <div className="mt-4">{aksi}</div>}
        </div>
        {ilustrasi && <div className="shrink-0 pr-2">{ilustrasi}</div>}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Baris fakta berlabel ikon (kontak, informasi pengiriman).
// ---------------------------------------------------------------
export function BarisFakta({ Ikon, label, nilai, children, warna = 'permukaan-1' }) {
  return (
    <div className="flex items-start gap-3.5 py-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${warna}`}>
        <Ikon size={21} weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15.5px] font-medium text-secondary">{label}</p>
        <p className="mt-0.5 text-[17px] font-semibold leading-snug text-primary">{nilai || children}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// Peringkat bintang. Selalu disertai angka, jadi warna dan bentuk
// bukan satu-satunya pembawa makna (brief §22).
// ---------------------------------------------------------------
export function Bintang({ nilai = 0, size = 17, className = '' }) {
  const penuh = Math.round(Number(nilai) || 0)
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${nilai} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9Z"
            fill={i <= penuh ? 'var(--color-signal-amber)' : 'var(--border-strong)'}
          />
        </svg>
      ))}
    </span>
  )
}

// ---------------------------------------------------------------
// Kotak pilihan (wizard & checkout).
// Terpilih = border teal + tanda centang, bukan warna saja.
// ---------------------------------------------------------------
export function PilihanKotak({ terpilih, onClick, Ikon, judul, ket, className = '', disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={terpilih}
      className={`flex w-full items-center gap-3.5 rounded-[var(--radius-card)] border-2 px-4 py-4 text-left transition-colors disabled:opacity-50 ${
        terpilih ? 'border-[var(--accent)] permukaan-1' : 'border-hairline surface-raised'
      } ${className}`}
    >
      {Ikon && (
        <span className={`shrink-0 ${terpilih ? 'text-accent' : 'text-muted'}`}>
          <Ikon size={24} weight="bold" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold leading-snug text-primary">{judul}</span>
        {ket && <span className="mt-0.5 block text-[15px] leading-snug text-secondary">{ket}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          terpilih ? 'border-[var(--accent)] bg-accent text-[var(--accent-contrast)]' : 'border-[var(--border-strong)]'
        }`}
      >
        {terpilih && <IconCentang size={14} weight="bold" />}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------
// Slot waktu (brief §8 langkah 4, §25 TimeSlot).
// ---------------------------------------------------------------
export function SlotWaktu({ waktu, terpilih, terisi, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={terisi}
      aria-pressed={terpilih}
      className={`numeric flex min-h-14 flex-col items-center justify-center rounded-[var(--radius-control)] border-2 px-2 text-[17px] font-semibold transition-colors ${
        terpilih
          ? 'border-[var(--accent)] permukaan-1 text-accent'
          : terisi
            ? 'cursor-not-allowed border-hairline surface-sunken text-muted'
            : 'border-hairline surface-raised text-primary active:surface-hover'
      } ${className}`}
    >
      {fmtJam(waktu)}
      {terisi && <span className="mt-0.5 text-[15px] font-medium">Sudah terisi</span>}
    </button>
  )
}
