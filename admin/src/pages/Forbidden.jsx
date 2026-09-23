import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { IconShield, IconArrowRight } from '../components/Icons'

// Halaman 403. Bukan sekadar angka besar abu-abu: dijelaskan apa yang
// terjadi, kenapa, dan jalan keluarnya (protokol redesign §"back navigation").
export default function Forbidden() {
  return (
    <div className="flex flex-col items-start gap-4 py-20">
      <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] text-[var(--color-signal-rose)]">
        <IconShield size={21} />
      </span>
      <div>
        <p className="numeric text-[12px] font-medium tracking-[0.08em] text-muted">KODE 403</p>
        <h1 className="mt-1.5 text-[22px] font-semibold tracking-tight text-primary">Akses ditolak</h1>
        <p className="mt-2 max-w-[56ch] text-[13.5px] leading-relaxed text-secondary">
          Modul ini di luar hak akses peran Anda. Hak akses diatur mengikuti matriks RBAC
          pada PRD bagian 5.1. Hubungi bidan bila Anda memang membutuhkannya.
        </p>
      </div>
      <Link to="/">
        <Button variant="secondary">
          Kembali ke Dashboard
          <IconArrowRight size={16} />
        </Button>
      </Link>
    </div>
  )
}
