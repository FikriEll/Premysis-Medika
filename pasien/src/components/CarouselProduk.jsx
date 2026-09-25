import { useCallback, useEffect, useRef, useState } from 'react'
import { KartuProduk } from './kartu'
import { IconPanahKiri, IconPanahKanan, IconPanahMiring } from './Icons'

// =============================================================
// Carousel produk mendatar (gaya referensi "product-carousel").
//
// Menampilkan kartu produk dalam satu baris yang bisa digeser ke
// samping, dengan tombol panah kiri/kanan yang muncul hanya bila
// isinya memang melebihi lebar layar. Di ponsel, geser dengan jari.
//
// Kartunya memakai komponen KartuProduk yang sudah dipakai di
// seluruh aplikasi (bentuk "ringkas"), jadi tampilannya konsisten -
// tidak ada markup kartu kedua yang harus dirawat terpisah.
//
// Catatan: animasi masuk memakai kelas .reveal (jaring pengaman
// fail-open di main.jsx), BUKAN whileInView. Animasi berbasis
// viewport tidak andal pada gulir cepat/programatik dan bisa
// membuat isi tampil kosong permanen.
//
// Warna memakai token aplikasi, jadi mode gelap ikut menyesuaikan.
// =============================================================

export default function CarouselProduk({
  judul,
  produk = [],
  onLihatSemua,
  onBuka,
  onTambah,
  boleh = true,
  jumlahDiKeranjang = () => 0,
  labelLihatSemua = 'Lihat semua',
  className = '',
}) {
  const jalurRef = useRef(null)
  const [bisaGeser, setBisaGeser] = useState(false)
  const [diAwal, setDiAwal] = useState(true)
  const [diAkhir, setDiAkhir] = useState(false)

  // Perbarui keadaan tombol panah: apakah isinya melebihi layar,
  // dan apakah sudah di ujung kiri/kanan.
  const periksa = useCallback(() => {
    const el = jalurRef.current
    if (!el) return
    setBisaGeser(el.scrollWidth > el.clientWidth + 4)
    setDiAwal(el.scrollLeft <= 2)
    setDiAkhir(Math.abs(el.scrollWidth - el.scrollLeft - el.clientWidth) < 2)
  }, [])

  useEffect(() => {
    periksa()
    const el = jalurRef.current
    el?.addEventListener('scroll', periksa, { passive: true })
    window.addEventListener('resize', periksa)
    // Isi carousel datang dari server setelah render pertama, jadi
    // ukuran perlu diperiksa ulang saat daftar produk berubah.
    return () => {
      el?.removeEventListener('scroll', periksa)
      window.removeEventListener('resize', periksa)
    }
  }, [periksa, produk.length])

  const geser = (arah) => {
    const el = jalurRef.current
    if (!el) return
    const jarak = el.clientWidth * 0.8
    el.scrollBy({ left: arah === 'kiri' ? -jarak : jarak, behavior: 'smooth' })
  }

  if (produk.length === 0) return null

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Judul + tautan lihat semua */}
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[21px] font-medium leading-tight tracking-tight text-heading sm:text-[24px]">
          {judul}
        </h2>
        {onLihatSemua && (
          <button
            type="button"
            onClick={onLihatSemua}
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15.5px] font-semibold text-accent"
          >
            {labelLihatSemua}
            <IconPanahMiring
              size={17}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        )}
      </div>

      <div className="relative">
        {/* Jalur produk: geser mendatar, bilah gulir disembunyikan */}
        <ul
          ref={jalurRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {produk.map((p) => (
            <li key={p.id} className="w-[210px] shrink-0 snap-start sm:w-[230px]">
              <KartuProduk
                ringkas
                produk={p}
                boleh={boleh}
                onBuka={onBuka}
                onTambah={onTambah}
                jumlahDiKeranjang={jumlahDiKeranjang(p)}
              />
            </li>
          ))}
        </ul>

        {/* Tombol panah - hanya bila isinya melebihi layar */}
        {bisaGeser && (
          <>
            <button
              type="button"
              onClick={() => geser('kiri')}
              disabled={diAwal}
              aria-label="Geser ke kiri"
              className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline surface-raised text-primary shadow-lift transition-opacity duration-200 hover:surface-hover disabled:pointer-events-none disabled:opacity-0 sm:flex"
            >
              <IconPanahKiri size={22} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => geser('kanan')}
              disabled={diAkhir}
              aria-label="Geser ke kanan"
              className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline surface-raised text-primary shadow-lift transition-opacity duration-200 hover:surface-hover disabled:pointer-events-none disabled:opacity-0 sm:flex"
            >
              <IconPanahKanan size={22} weight="bold" />
            </button>
          </>
        )}
      </div>
    </section>
  )
}
