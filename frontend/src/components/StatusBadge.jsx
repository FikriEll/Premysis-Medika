import { statusMap, tones } from './statusMap'

// Badge status.
// Aturan skill: titik berwarna dilarang sebagai hiasan (Section 9.F).
// Titik di sini dipertahankan HANYA karena ia menyampaikan keadaan
// sebenarnya (status pesanan/appointment), bukan dekorasi.
export default function StatusBadge({ status, className = '', dot = true }) {
  const conf = statusMap[status] || { tone: 'slate' }
  const label = conf.label || status
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12px] font-medium ${tones[conf.tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-75" aria-hidden="true" />}
      {label}
    </span>
  )
}
