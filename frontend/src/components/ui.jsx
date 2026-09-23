// =============================================================
// Komponen UI dasar - versi redesign (skill: design-taste-frontend).
//
// Prinsip yang dipaksa di sini:
// - Satu skala radius: kontrol 8px, kartu 14px.
// - Kartu hanya dipakai kalau elevasi benar-benar menyatakan hierarki.
//   Untuk mengelompokkan data dipakai garis rambut / ruang kosong.
// - Shadow selalu ditint ke hue latar, tidak ada drop shadow hitam pekat.
// - Semua state interaktif lengkap: hover, active (tekanan fisik),
//   focus-visible, disabled.
// - Angka data memakai monospace tabular (.numeric).
// - Label SELALU di atas input, helper di bawah (tidak ada
//   placeholder-sebagai-label).
import { IconSearch, IconAlert, IconClose } from './Icons'

// =============================================================

export function Panel({ title, subtitle, action, children, className = '', divided = true }) {
  return (
    <section className={`surface-raised rounded-[var(--radius-card)] border border-hairline shadow-soft ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-tight text-primary">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[13px] text-secondary">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={divided ? 'border-t border-hairline' : ''}>{children}</div>
    </section>
  )
}

const VARIANTS = {
  primary:
    'bg-accent text-[var(--accent-contrast)] hover:brightness-[1.08] active:brightness-[0.96] shadow-soft',
  secondary:
    'surface-raised border border-strong text-primary hover:surface-hover active:brightness-[0.98]',
  ghost: 'text-secondary hover:surface-hover hover:text-primary',
  danger: 'bg-[var(--color-signal-rose-solid)] text-white hover:brightness-[1.08] active:brightness-[0.96]',
  success: 'bg-[var(--color-signal-green-solid)] text-white hover:brightness-[1.08] active:brightness-[0.96]',
  // Tautan teks: mengurangi kebisingan visual dibanding tombol penuh.
  link: 'text-accent hover:underline underline-offset-4 px-0',
}

const SIZES = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-[13.5px] gap-2',
  lg: 'h-11 px-5 text-[13.5px] gap-2',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const isLink = variant === 'link'
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-control)] font-medium transition-[background-color,color,filter,transform,border-color] duration-200 ease-[var(--ease-out-soft)] disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px ${
        isLink ? 'h-auto' : ''
      } ${VARIANTS[variant]} ${isLink ? 'text-[13.5px]' : SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Tombol ikon: target sentuh tetap 36px walau ikonnya kecil.
export function IconButton({ label, children, className = '', tone = 'default', ...props }) {
  const tones = {
    default: 'text-secondary hover:surface-hover hover:text-primary',
    danger: 'text-secondary hover:bg-[var(--color-signal-rose-soft)] hover:text-[var(--color-signal-rose)]',
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] transition-colors duration-200 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, children, required, hint, error, htmlFor }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 flex items-baseline gap-1 text-[12.5px] font-medium text-secondary">
        {label}
        {required && (
          <span className="text-[var(--color-signal-rose)]" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-[var(--color-signal-rose)]">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-[12px] text-muted">{hint}</span>
      )}
    </label>
  )
}

const inputBase =
  'w-full rounded-[var(--radius-control)] border border-strong bg-[var(--surface-raised)] px-3 text-[13.5px] text-primary placeholder:text-muted transition-[border-color,box-shadow] duration-200 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/25 disabled:opacity-60'

export function Input({ className = '', ...props }) {
  return <input className={`${inputBase} h-9 ${className}`} {...props} />
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${inputBase} h-9 pr-8 ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputBase} min-h-[84px] resize-y py-2 leading-relaxed ${className}`} {...props} />
}

export function SearchInput({ value, onChange, placeholder = 'Cari...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
        <IconSearch size={17} />
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputBase} h-9 pl-8.5`}
      />
    </div>
  )
}

// Keadaan kosong yang benar-benar dirancang, bukan teks abu-abu polos.
export function EmptyState({ title = 'Tidak ada data', message, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] surface-sunken text-muted">
          {icon}
        </span>
      )}
      <div>
        <p className="text-[13.5px] font-medium text-primary">{title}</p>
        {message && <p className="mx-auto mt-1 max-w-[46ch] text-[13px] leading-relaxed text-secondary">{message}</p>}
      </div>
      {action}
    </div>
  )
}

// =============================================================
// Metric - pengganti kartu "Stat" bergaya kotak.
// VISUAL_DENSITY 6: metrik bernapas di tata letak polos, dipisah
// garis rambut, tanpa kotak bertumpuk.
// =============================================================
export function Metric({ label, value, sub, icon, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'text-primary',
    accent: 'text-accent',
    amber: 'text-[var(--color-signal-amber)]',
    rose: 'text-[var(--color-signal-rose)]',
    green: 'text-[var(--color-signal-green)]',
    blue: 'text-[var(--color-signal-blue)]',
  }
  return (
    <div className={`flex flex-col gap-2 px-5 py-4 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted">{icon}</span>}
        <p className="text-[12.5px] font-medium text-secondary">{label}</p>
      </div>
      <p className={`numeric text-[26px] font-semibold leading-none tracking-tight ${tones[tone]}`}>
        {value}
      </p>
      {sub && <p className="text-[12px] text-muted">{sub}</p>}
    </div>
  )
}

// Deret metrik: satu bingkai, dipisah garis rambut. Bukan 4 kartu terpisah.
export function MetricStrip({ children, className = '' }) {
  return (
    <div
      className={`grid grid-cols-2 divide-y divide-[var(--border-hairline)] overflow-hidden rounded-[var(--radius-card)] border border-hairline surface-raised shadow-soft sm:divide-y-0 lg:grid-cols-4 ${className}`}
    >
      <div className="contents [&>*]:border-[var(--border-hairline)] [&>*]:border-b [&>*]:sm:border-b-0 [&>*]:sm:border-l [&>*:first-child]:sm:border-l-0">
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// GalatBar
//
// Setiap aksi tulis di dashboard admin dikirim ke REST API bersama.
// Server menegakkan aturan bisnis (BR-02..BR-10) dan menolak
// permintaan yang melanggar dengan pesan yang jelas. Tanpa bilah ini
// penolakan itu akan hilang diam-diam dan tombol tampak "tidak
// bereaksi". Tampilkan pesan server apa adanya.
// ---------------------------------------------------------------
export function GalatBar({ pesan, onClose }) {
  if (!pesan) return null
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-signal-rose)] bg-[var(--color-signal-rose-soft)] px-4 py-3"
    >
      <IconAlert size={18} weight="fill" className="mt-0.5 shrink-0 text-[var(--color-signal-rose)]" />
      <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--color-signal-rose)]">{pesan}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pesan"
          className="shrink-0 rounded-md p-1 text-[var(--color-signal-rose)] transition-colors duration-150 hover:bg-black/5"
        >
          <IconClose size={15} />
        </button>
      )}
    </div>
  )
}
