import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { IconArrowRight } from '../components/Icons'

// Halaman 404: tetap memberi jalan keluar, bukan jalan buntu.
export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-20">
      <div>
        <p className="numeric text-[12px] font-medium tracking-[0.08em] text-muted">KODE 404</p>
        <h1 className="mt-1.5 text-[22px] font-semibold tracking-tight text-primary">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 max-w-[56ch] text-[13.5px] leading-relaxed text-secondary">
          Alamat yang Anda buka tidak tersedia. Periksa kembali tautannya atau kembali ke
          dashboard untuk melanjutkan pekerjaan.
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
