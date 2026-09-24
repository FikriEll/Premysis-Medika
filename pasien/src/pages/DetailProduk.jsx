import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { Kartu, Tombol, Lencana, Kosong, PengaturJumlah, BarisInfo, Memuat, Galat } from '../components/ui'
import { IconProduk, IconKeranjang, IconPeringatan, IconInfo, IconToko, IconHati } from '../components/Icons'
import { IlustrasiObat } from '../components/Ilustrasi'

// F-08 Detail Produk.
//
// Urutan sesuai kebutuhan pembeli: gambar + nama + harga dulu,
// tombol Tambah ke Keranjang, baru keterangan tambahan di bawah.
export default function DetailProduk() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { ambilProdukDetail, tambahKeranjang, jumlahDiKeranjang, beriToast, user, toggleWishlist, wishlistIds } = useStore()

  const [produk, setProduk] = useState(null)
  const [terkait, setTerkait] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')
  const [jumlah, setJumlah] = useState(1)

  useEffect(() => {
    let batal = false
    setMemuat(true)
    ambilProdukDetail(slug)
      .then((res) => {
        if (batal) return
        setProduk(res.data)
        setTerkait(res.related || [])
        setGalat('')
      })
      .catch((e) => !batal && setGalat(e.message))
      .finally(() => !batal && setMemuat(false))
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (memuat) return <Memuat baris={4} />

  if (galat || !produk) {
    return (
      <Kartu padat>
        <Kosong
          judul="Produk tidak ditemukan"
          pesan={galat || 'Produk ini mungkin sudah tidak dijual lagi.'}
          ikon={<IconProduk size={24} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/toko', { replace: true })}>
              Kembali ke Toko
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  const habis = !produk.in_stock || produk.stock <= 0
  const boleh = !produk.requires_prescription

  const tambah = async () => {
    if (!user) {
      beriToast('Masuk dulu untuk menambah ke keranjang.', 'info')
      nav('/masuk', { state: { dari: `/produk/${produk.slug}` } })
      return
    }
    try {
      await tambahKeranjang(produk.id, jumlah)
      beriToast(`${jumlah} ${produk.unit} ${produk.name} masuk keranjang.`, 'sukses')
      nav('/keranjang')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  const favorit = wishlistIds.map(Number).includes(Number(produk.id))

  const simpanFavorit = async () => {
    if (!user) {
      beriToast('Masuk dulu untuk menyimpan produk favorit.', 'info')
      nav('/masuk', { state: { dari: `/produk/${produk.slug}` } })
      return
    }
    try {
      await toggleWishlist(produk.id)
      beriToast(favorit ? `${produk.name} dihapus dari favorit.` : `${produk.name} disimpan ke favorit.`, 'sukses')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  return (
    <div className="space-y-5">
      {/* --- Bagian utama: gambar di kiri, informasi di kanan saat layar lebar --- */}
      <Kartu className="md:grid md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:items-start md:gap-7 md:space-y-0">
        <div className="flex h-56 items-center justify-center overflow-hidden rounded-[var(--radius-control)] permukaan-1 text-accent md:h-[380px]">
          {produk.image ? (
            <img src={produk.image} alt={produk.name} className="h-full w-full object-cover" />
          ) : (
            <IconProduk size={68} weight="bold" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-[24px] font-bold leading-snug tracking-tight text-primary md:text-[28px]">{produk.name}</h1>
            <p className="mt-1 text-[16px] text-secondary">{produk.category?.name || 'Produk kesehatan'}</p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <p className="numeric text-[30px] font-bold leading-none text-primary">{fmtRupiah(produk.price)}</p>
            <div className="flex items-center gap-3">
              <p className="text-[16px] text-secondary">per {produk.unit}</p>
              <button
                type="button"
                onClick={simpanFavorit}
                aria-label={favorit ? `Hapus ${produk.name} dari favorit` : `Simpan ${produk.name} ke favorit`}
                aria-pressed={favorit}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline surface-raised text-[var(--color-signal-rose)] active:surface-hover"
              >
                <IconHati size={22} weight={favorit ? 'fill' : 'regular'} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {produk.requires_prescription && (
              <Lencana tone="amber" ikon={<IconPeringatan size={14} weight="bold" />}>
                Perlu resep
              </Lencana>
            )}
            {habis ? (
              <Lencana tone="rose">Stok habis</Lencana>
            ) : (
              <Lencana tone="green">
                <span className="numeric">Tersedia {produk.stock} {produk.unit}</span>
              </Lencana>
            )}
          </div>

          {/* --- Peringatan resep, kalau perlu --- */}
          {!boleh && (
            <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-amber-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-amber)]">
              <IconPeringatan size={20} weight="bold" className="mt-0.5 shrink-0" />
              <span>
                Produk ini memerlukan resep dokter/bidan. Unggah resep Anda saat checkout, lalu apotek
                akan memverifikasinya sebelum pesanan diproses.
              </span>
            </p>
          )}
        </div>
      </Kartu>

      {/* --- Tindakan utama --- */}
      {!habis && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[17px] font-semibold text-primary">Jumlah</span>
            <PengaturJumlah
              nilai={jumlah}
              min={1}
              max={produk.stock}
              onKurang={() => setJumlah((n) => Math.max(1, n - 1))}
              onTambah={() => setJumlah((n) => Math.min(produk.stock, n + 1))}
            />
          </div>

          <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
            <BarisInfo label="Subtotal" className="py-1">
              <span className="numeric text-[20.5px] font-bold text-primary">
                {fmtRupiah(produk.price * jumlah)}
              </span>
            </BarisInfo>
          </div>

          <Tombol size="lg" penuh onClick={tambah}>
            <IconKeranjang size={21} weight="bold" />
            Tambah ke Keranjang
          </Tombol>
        </>
      )}

      {habis && (
        <Kartu>
          <Kosong
            judul="Stok sedang habis"
            pesan="Silakan hubungi apotek untuk menanyakan ketersediaan produk ini."
            ikon={<IconInfo size={24} />}
            aksi={
              <Tombol size="lg" variant="secondary" onClick={() => nav('/toko')}>
                Lihat Produk Lain
              </Tombol>
            }
          />
        </Kartu>
      )}

      {/* --- Keterangan tambahan --- */}
      <Kartu className="space-y-3">
        <h2 className="text-[18.5px] font-semibold tracking-tight text-primary">Keterangan</h2>
        {produk.description && (
          <p className="text-[17px] leading-relaxed text-secondary">{produk.description}</p>
        )}

        <div className="divide-y divide-[var(--border-hairline)]">
          <BarisInfo label="Kategori">{produk.category?.name || '-'}</BarisInfo>
          <BarisInfo label="Golongan">{produk.drug_class_label}</BarisInfo>
          {produk.composition && <BarisInfo label="Komposisi">{produk.composition}</BarisInfo>}
          {produk.dosage && <BarisInfo label="Dosis">{produk.dosage}</BarisInfo>}
          {produk.manufacturer && <BarisInfo label="Produsen">{produk.manufacturer}</BarisInfo>}
          <BarisInfo label="Satuan">{produk.unit}</BarisInfo>
          <BarisInfo label="Ketersediaan">
            <span className="numeric">{habis ? 'Habis' : `${produk.stock} ${produk.unit}`}</span>
          </BarisInfo>
        </div>
      </Kartu>

      {/* --- Produk terkait --- */}
      {terkait.length > 0 && (
        <section>
          <h2 className="mb-3 text-[18.5px] font-semibold tracking-tight text-primary">
            Produk Serupa
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {terkait.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Kartu padat>
                  <button
                    type="button"
                    onClick={() => nav(`/produk/${p.slug}`)}
                    className="flex w-full items-center gap-3 p-3.5 text-left"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] permukaan-1 text-accent">
                      {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <IconProduk size={24} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] font-semibold text-primary">{p.name}</span>
                      <span className="numeric mt-0.5 block text-[16px] font-bold text-primary">{fmtRupiah(p.price)}</span>
                    </span>
                  </button>
                </Kartu>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/toko')}>
        <IconToko size={20} weight="bold" />
        Kembali ke Toko
      </Tombol>
    </div>
  )
}
