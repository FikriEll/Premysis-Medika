import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Kartu, InputCari, Tombol, Kosong, Memuat, Galat } from '../components/ui'
import { KartuProduk } from '../components/kartu'
import { IconKeranjang, IconObat, IconPerawatan, IconHati, IconBayi, IconToko, IconPesanan } from '../components/Icons'
import { IlustrasiKeranjang } from '../components/Ilustrasi'

// F-07 Toko - e-commerce.
//
// Kategori disajikan sebagai kartu besar berikon + teks (bukan tab
// kecil), satu daftar produk sederhana, dan pencarian untuk yang
// sudah tahu nama obatnya. Data diambil dari API apotek, jadi stok
// dan harga selalu sama dengan yang dilihat petugas.
const GAYA_KATEGORI = [
  { cocok: /obat/i, Ikon: IconObat, warna: 'permukaan-mint' },
  { cocok: /vitamin|suplemen/i, Ikon: IconHati, warna: 'permukaan-coral' },
  { cocok: /ibu|bayi|anak/i, Ikon: IconBayi, warna: 'permukaan-peach' },
  { cocok: /alat|kesehatan|perawatan/i, Ikon: IconPerawatan, warna: 'permukaan-sky' },
]
const gayaKategori = (nama) =>
  GAYA_KATEGORI.find((g) => g.cocok.test(nama)) || { Ikon: IconToko, warna: 'permukaan-sky' }

const SORT = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga termurah' },
  { value: 'price_desc', label: 'Harga tertinggi' },
  { value: 'popular', label: 'Paling laris' },
]

export default function Toko() {
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    kategori, daftarProduk, metaProduk, memuatProduk, ambilProduk,
    tambahKeranjang, jumlahKeranjang, jumlahDiKeranjang, beriToast, user,
  } = useStore()

  const [q, setQ] = useState('')
  const [sort, setSort] = useState('latest')
  const [galat, setGalat] = useState('')
  const katSlug = params.get('kategori') || ''
  const kategoriAktif = kategori.find((k) => k.slug === katSlug)

  // Ambil produk dari API saat kata kunci / kategori / urutan berubah.
  // Pencarian ditunda 350ms supaya tidak membanjiri server tiap ketikan.
  useEffect(() => {
    let batal = false
    const t = setTimeout(async () => {
      try {
        setGalat('')
        await ambilProduk({ q: q.trim(), category: katSlug, sort, per_page: 24 })
      } catch (e) {
        if (!batal) setGalat(e.message)
      }
    }, 350)
    return () => {
      batal = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, katSlug, sort])

  const pilihKategori = (slug) => {
    const next = new URLSearchParams(params)
    if (slug) next.set('kategori', slug)
    else next.delete('kategori')
    setParams(next)
  }

  const tambah = async (p) => {
    if (!user) {
      beriToast('Masuk dulu untuk menambah ke keranjang.', 'info')
      nav('/masuk', { state: { dari: '/toko' } })
      return
    }
    try {
      await tambahKeranjang(p.id, 1)
      beriToast(`${p.name} masuk keranjang.`, 'sukses')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  const tampilKategori = !kategoriAktif && !q

  return (
    <div className="space-y-5">
      {/* Pintasan ke keranjang: selalu terlihat kalau ada isinya. */}
      {jumlahKeranjang > 0 && (
        <button
          type="button"
          onClick={() => nav('/keranjang')}
          className="flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-card)] border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 text-left"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-[var(--accent-contrast)]">
            <IconKeranjang size={21} weight="bold" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-bold text-primary">
              {jumlahKeranjang} barang di keranjang
            </span>
            <span className="block text-[16px] font-semibold text-accent">Lanjutkan ke keranjang</span>
          </span>
        </button>
      )}

      {/* Kategori utama */}
      {tampilKategori && kategori.length > 0 && (
        <section>
          <h2 className="mb-3 text-[20.5px] font-bold tracking-tight text-primary">
            Mau beli apa hari ini?
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {kategori.map((k) => {
              const g = gayaKategori(k.name)
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => pilihKategori(k.slug)}
                  className="flex min-h-32 flex-col items-start gap-2.5 rounded-[var(--radius-card)] border border-hairline surface-raised p-4 text-left transition-colors active:surface-hover hover:border-strong"
                >
                  <span className={`flex h-13 w-13 items-center justify-center rounded-[var(--radius-control)] ${g.warna}`}>
                    <g.Ikon size={27} weight="bold" />
                  </span>
                  <span className="text-[18.5px] font-bold leading-snug text-primary">{k.name}</span>
                  <span className="text-[16px] leading-snug text-secondary">
                    {k.products_count != null ? `${k.products_count} produk` : 'Lihat produk'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Pencarian + urutan: berdampingan di layar lebar */}
      <div className="grid gap-3 sm:grid-cols-[1fr_240px] sm:items-end">
        <InputCari
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama obat atau produk..."
        />

        <label className="block">
          <span className="mb-1.5 block text-[15.5px] font-medium text-secondary">Urutkan</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-12 w-full rounded-[var(--radius-control)] border border-strong bg-[var(--surface-raised)] px-4 text-[17px] text-primary"
          >
            {SORT.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Judul daftar + tombol kembali ke kategori */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 flex-1 truncate text-[18.5px] font-semibold tracking-tight text-primary">
          {q ? `Hasil "${q}"` : kategoriAktif ? kategoriAktif.name : 'Semua produk'}
        </h2>
        {(kategoriAktif || q) && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              pilihKategori('')
            }}
            className="min-h-11 shrink-0 text-[16px] font-semibold text-accent"
          >
            Lihat semua
          </button>
        )}
      </div>

      {galat ? (
        <Galat pesan={galat} onCoba={() => ambilProduk({ q: q.trim(), category: katSlug, sort, per_page: 24 })} />
      ) : memuatProduk && daftarProduk.length === 0 ? (
        <Memuat baris={3} />
      ) : daftarProduk.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Produk tidak ditemukan"
            pesan="Coba tulis nama lain, atau tekan Lihat semua untuk melihat seluruh produk."
            ilustrasi={<IlustrasiKeranjang size={132} />}
            aksi={
              <Tombol
                size="lg"
                variant="secondary"
                onClick={() => {
                  setQ('')
                  pilihKategori('')
                }}
              >
                Lihat Semua Produk
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <>
          {/* Ponsel: daftar satu kolom (nyaman dibaca & ditekan) */}
          <ul className="space-y-3 lg:hidden">
            {daftarProduk.map((p) => (
              <li key={p.id}>
                <KartuProduk
                  produk={p}
                  jumlahDiKeranjang={jumlahDiKeranjang(p.id)}
                  onBuka={() => nav(`/produk/${p.slug}`)}
                  onTambah={tambah}
                />
              </li>
            ))}
          </ul>

          {/* Layar besar: grid kartu tegak, 2-4 kolom */}
          <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3 xl:grid-cols-4">
            {daftarProduk.map((p) => (
              <li key={p.id}>
                <KartuProduk
                  ringkas
                  produk={p}
                  jumlahDiKeranjang={jumlahDiKeranjang(p.id)}
                  onBuka={() => nav(`/produk/${p.slug}`)}
                  onTambah={tambah}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {daftarProduk.length > 0 && jumlahKeranjang > 0 && (
        <Tombol size="lg" penuh onClick={() => nav('/keranjang')}>
          <IconPesanan size={20} weight="bold" />
          Buka Keranjang ({jumlahKeranjang})
        </Tombol>
      )}
    </div>
  )
}
