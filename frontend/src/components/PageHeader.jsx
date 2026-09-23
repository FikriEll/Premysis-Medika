// Header halaman.
//
// Aturan skill §4.7: DILARANG pola "judul besar kiri + paragraf
// penjelas kecil mengambang di kanan". Header di sini bertumpuk
// vertikal: judul, lalu deskripsi di bawahnya (lebar terbatas).
export default function PageHeader({ title, subtitle, actions, children }) {
  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h1 className="text-[21px] font-semibold leading-tight tracking-[-0.01em] text-primary">{title}</h1>
        {subtitle && <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      {children}
    </header>
  )
}
