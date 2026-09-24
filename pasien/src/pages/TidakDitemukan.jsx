import { useNavigate } from 'react-router-dom'
import { Tombol } from '../components/ui'
import { IlustrasiTidakDitemukan } from '../components/Ilustrasi'

// Halaman 404.
//
// Dirender DI DALAM LayoutPublik (lihat App.jsx), jadi pengunjung
// tetap melihat header, footer, dan bisa lanjut menjelajah - bukan
// halaman telanjang tanpa jalan kembali.
//
// Judulnya ditulis sebagai <h1> sendiri (bukan lewat komponen
// Kosong yang memakai <p>), supaya setiap halaman tetap punya satu
// judul utama untuk pembaca layar dan mesin pencari.
export default function TidakDitemukan() {
  const nav = useNavigate()
  return (
    <div className="mx-auto flex max-w-[46rem] flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <IlustrasiTidakDitemukan size={150} />
      <h1 className="text-[25px] font-medium leading-snug tracking-tight text-heading">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-[42ch] text-[16px] leading-relaxed text-secondary">
        Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Periksa kembali
        tautannya, atau mulai dari beranda.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Tombol size="lg" onClick={() => nav('/', { replace: true })}>
          Kembali ke Beranda
        </Tombol>
        <Tombol size="lg" variant="secondary" onClick={() => nav('/toko')}>
          Lihat Katalog
        </Tombol>
      </div>
    </div>
  )
}
