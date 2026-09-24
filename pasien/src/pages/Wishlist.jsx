import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../lib/store'
import { Kartu, KepalaHalaman, JudulSeksi, Tombol, Kosong, Memuat, Galat } from '../components/ui'
import { KartuProduk } from '../components/kartu'
import { IconHati, IconKeranjang, IconToko } from '../components/Icons'
import { IlustrasiWishlist, IlustrasiKosong } from '../components/Ilustrasi'

// Halaman Wishlist (produk yang disimpan).
//
// Wishlist disimpan di server, jadi daftar ini sama di semua
// perangkat yang dipakai pelanggan. Tombol hati di setiap kartu
// melepas produk dari daftar tanpa berpindah halaman.
export default function Wishlist() {
  const nav = useNavigate()
  const { toggleWishlist, tambahKeranjang, jumlahDiKeranjang, beriToast, simpanProdukKeCache } = useStore()
  const [data, setData] = useState(null)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(null)

  const muat = () => {
    setData(null)
    setGalat('')
    api
      .wishlist()
      .then((r) => {
        const daftar = (r.data || []).map((w) => w.product).filter(Boolean)
        simpanProdukKeCache(daftar)
        setData(daftar)
      })
      .catch((e) => setGalat(e.message))
  }

  useEffect(() => {
    muat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lepas = async (p) => {
    setSibuk(p.id)
    try {
      await toggleWishlist(p.id)
      setData((d) => d.filter((x) => x.id !== p.id))
      beriToast(`${p.name} dihapus dari wishlist.`, 'info')
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(null)
    }
  }

  const tambah = async (p) => {
    try {
      await tambahKeranjang(p.id, 1)
      beriToast(`${p.name} masuk keranjang.`, 'sukses')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  if (galat) {
    return <Galat judul="Gagal memuat wishlist" pesan={galat} onCoba={muat} />
  }

  return (
    <div className="space-y-6">
      <KepalaHalaman
        judul="Produk Favorit Saya"
        pengantar="Simpan obat dan kebutuhan kesehatan yang sering Anda beli agar mudah dicari lagi."
        ilustrasi={<IlustrasiWishlist size={148} />}
      />

      {!data ? (
        <Memuat baris={3} />
      ) : data.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Wishlist masih kosong"
            pesan="Tekan ikon hati pada produk di halaman Toko untuk menyimpannya di sini."
            ilustrasi={<IlustrasiKosong size={130} />}
            aksi={
              <Tombol size="lg" onClick={() => nav('/toko')}>
                <IconToko size={20} weight="bold" />
                Jelajahi Toko
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <section>
          <JudulSeksi>{data.length} produk tersimpan</JudulSeksi>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((p) => (
              <li key={p.id} className="relative">
                <KartuProduk
                  ringkas
                  produk={p}
                  onBuka={() => nav(`/produk/${p.slug}`)}
                  onTambah={tambah}
                  jumlahDiKeranjang={jumlahDiKeranjang(p.id)}
                />
                <button
                  type="button"
                  onClick={() => lepas(p)}
                  disabled={sibuk === p.id}
                  aria-label={`Hapus ${p.name} dari wishlist`}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full surface-raised text-[var(--color-signal-rose)] shadow-soft disabled:opacity-50"
                >
                  <IconHati size={20} weight="fill" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/keranjang')}>
        <IconKeranjang size={20} weight="bold" />
        Buka Keranjang
      </Tombol>
    </div>
  )
}
