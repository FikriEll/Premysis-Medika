import { useNavigate } from 'react-router-dom'
import { Tombol, Kosong } from '../components/ui'
import { IlustrasiTidakDitemukan } from '../components/Ilustrasi'

export default function TidakDitemukan() {
  const nav = useNavigate()
  return (
    <div className="py-6">
      <Kosong
        judul="Halaman tidak ditemukan"
        pesan="Tautan yang Anda buka tidak tersedia atau sudah dipindahkan."
        ilustrasi={<IlustrasiTidakDitemukan size={150} />}
        aksi={<Tombol onClick={() => nav('/', { replace: true })}>Kembali ke Beranda</Tombol>}
      />
    </div>
  )
}
