import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Kartu, InputCari, Tombol, Kosong } from '../components/ui'
import { KartuProduk } from '../components/kartu'
import { IconKeranjang, IconObat, IconPerawatan, IconHati, IconBayi, IconPesanan, IconToko } from '../components/Icons'
import { IlustrasiKeranjang } from '../components/Ilustrasi'

// F-07 Beli Obat (Toko) - brief §10.
//
// Brief §10 meminta pengalaman seperti marketplace SEDERHANA, bukan
// marketplace besar. Jadi:
// - kategori utama disajikan sebagai 4 kartu besar berikon + teks,
//   bukan deretan tab kecil yang harus ditebak artinya;
// - satu daftar produk, kartu sederhana berisi nama, harga, status
//   ketersediaan, dan satu tombol "Tambah";
// - pencarian tetap tersedia untuk yang sudah tahu nama obatnya.

// Ikon & warna dipilih dari NAMA kategori (bukan id tetap), supaya
// admin bebas menambah/mengubah kategori di dashboard dan katalog
// pasien tetap tampil rapi. Kategori tanpa kata kunci yang cocok
// memakai ikon toko sebagai cadangan.
const GAYA_KATEGORI = [
  { cocok: /obat/i, Ikon: IconObat, warna: 'permukaan-mint' },
  { cocok: /vitamin|suplemen/i, Ikon: IconHati, warna: 'permukaan-coral' },
  { cocok: /ibu|bayi|anak/i, Ikon: IconBayi, warna: 'permukaan-peach' },
  { cocok: /alat|kesehatan/i, Ikon: IconPerawatan, warna: 'permukaan-sky' },
]
const gayaKategori = (nama) =>
  GAYA_KATEGORI.find((g) => g.cocok.test(nama)) || { Ikon: IconToko, warna: 'permukaan-sky' }

export default function Toko() {
  const nav = useNavigate()
  const { produkAktif, kategori, produkPerKategori, tambahKeranjang, jumlahKeranjang, bolehBeli, beriToast, itemKeranjang } = useStore()
  const [q, setQ] = useState('')
  const [kat, setKat] = useState(null)

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase()
    return produkAktif.filter((p) => {
      const cocokKat = !kat || Number(p.id_kategori) === Number(kat)
      const cocokKata =
        !kata || p.nama.toLowerCase().includes(kata) || (p.deskripsi || '').toLowerCase().includes(kata)
      return cocokKat && cocokKata
    })
  }, [produkAktif, q, kat])

  const jumlahDiKeranjang = (id) => itemKeranjang.find((x) => x.id_produk === id)?.jumlah || 0

  const tambah = (p) => {
    if (jumlahDiKeranjang(p.id) + 1 > p.stok) {
      beriToast(`Stok ${p.nama} tinggal ${p.stok} ${p.satuan}.`, 'galat')
      return
    }
    tambahKeranjang(p.id, 1)
    beriToast(`${p.nama} masuk keranjang.`, 'sukses')
  }

  const kategoriAktif = kategori.find((k) => k.id === Number(kat))

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

      {/* Kategori utama (brief §10) */}
      {!kategoriAktif && !q && (
        <section>
          <h2 className="mb-3 text-[20.5px] font-bold tracking-tight text-primary">
            Mau beli apa hari ini?
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {kategori.map((k) => {
              const g = gayaKategori(k.nama)
              const jumlah = produkPerKategori(k.id).length
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKat(k.id)}
                  className="flex min-h-32 flex-col items-start gap-2.5 rounded-[var(--radius-card)] border border-hairline surface-raised p-4 text-left transition-colors active:surface-hover"
                >
                  <span className={`flex h-13 w-13 items-center justify-center rounded-[var(--radius-control)] ${g.warna}`}>
                    <g.Ikon size={27} weight="bold" />
                  </span>
                  <span className="text-[18.5px] font-bold leading-snug text-primary">{k.nama}</span>
                  <span className="text-[16px] leading-snug text-secondary">
                    {k.deskripsi || `${jumlah} produk`}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Pencarian */}
      <InputCari
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari nama obat atau produk..."
      />

      {/* Judul daftar + tombol kembali ke kategori */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18.5px] font-semibold tracking-tight text-primary">
          {q ? `Hasil pencarian "${q}"` : kategoriAktif ? kategoriAktif.nama : 'Semua produk'}
        </h2>
        {(kategoriAktif || q) && (
          <button
            type="button"
            onClick={() => {
              setKat(null)
              setQ('')
            }}
            className="min-h-11 shrink-0 text-[16px] font-semibold text-accent"
          >
            Lihat semua
          </button>
        )}
      </div>

      {hasil.length === 0 ? (
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
                  setKat(null)
                }}
              >
                Lihat Semua Produk
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <ul className="space-y-3">
          {hasil.map((p) => (
            <li key={p.id}>
              <KartuProduk
                produk={p}
                boleh={bolehBeli(p)}
                jumlahDiKeranjang={jumlahDiKeranjang(p.id)}
                onBuka={() => nav(`/produk/${p.id}`)}
                onTambah={tambah}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Jalan lain ke keranjang di bagian bawah daftar. */}
      {hasil.length > 0 && jumlahKeranjang > 0 && (
        <Tombol size="lg" penuh onClick={() => nav('/keranjang')}>
          <IconPesanan size={20} weight="bold" />
          Buka Keranjang ({jumlahKeranjang})
        </Tombol>
      )}
    </div>
  )
}
