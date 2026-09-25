import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { gambarProduk } from '../lib/gambar'
import { Kartu, Tombol, Lencana, Kosong, PengaturJumlah, BarisInfo, Memuat } from '../components/ui'
import {
  IconProduk, IconKeranjang, IconPeringatan, IconInfo, IconToko, IconHati,
  IconPanahKanan, IconLabel, IconPenggaris, IconBagikan,
  IconKirimPesan, IconKamera, IconTerverifikasi, IconJam, IconCentangBulat,
} from '../components/Icons'

// F-08 Detail Produk.
//
// Susunan mengikuti referensi "product detail page":
//   remah roti -> galeri gambar -> judul + harga -> tombol beli ->
//   lencana/tag -> keterangan -> info penjual.
//
// Referensi memakai komponen shadcn (Button, Badge, Avatar) dan
// animasi framer-motion. Karena proyek ini JSX tanpa shadcn, gaya
// itu dipetakan ke komponen sendiri (Tombol, Lencana, AvatarPasien)
// dan token warna aplikasi - jadi tidak ada ketergantungan baru dan
// mode gelap tetap bekerja.
//
// Seluruh fungsi lama dipertahankan: pemilih jumlah, subtotal,
// tambah ke keranjang, favorit, peringatan resep, produk serupa.
export default function DetailProduk() {
  const { slug } = useParams()
  const nav = useNavigate()
  const {
    ambilProdukDetail, tambahKeranjang, jumlahDiKeranjang, beriToast,
    user, toggleWishlist, wishlistIds, pengaturan,
  } = useStore()

  const [produk, setProduk] = useState(null)
  const [terkait, setTerkait] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')
  const [jumlah, setJumlah] = useState(1)
  const [bukaKeterangan, setBukaKeterangan] = useState(false)
  const [indeksGambar, setIndeksGambar] = useState(0)

  useEffect(() => {
    let batal = false
    setMemuat(true)
    ambilProdukDetail(slug)
      .then((res) => {
        if (batal) return
        setProduk(res.data)
        setTerkait(res.related || [])
        setGalat('')
        setIndeksGambar(0)
        setBukaKeterangan(false)
        setJumlah(1)
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
  const namaKlinik = pengaturan?.site_name || 'Klinik Premysis Medika'

  // Galeri: server saat ini mengirim satu gambar per produk. Bila
  // suatu saat ada beberapa, titik navigasi otomatis muncul.
  const gambar = [gambarProduk(produk)]

  const tambah = async (langsungKeKeranjang = false) => {
    if (!user) {
      beriToast('Masuk dulu untuk menambah ke keranjang.', 'info')
      nav('/masuk', { state: { dari: `/produk/${produk.slug}` } })
      return
    }
    try {
      await tambahKeranjang(produk.id, jumlah)
      beriToast(`${jumlah} ${produk.unit} ${produk.name} masuk keranjang.`, 'sukses')
      if (langsungKeKeranjang) nav('/keranjang')
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

  // Bagikan tautan produk. Memakai berbagi bawaan perangkat bila ada,
  // kalau tidak salin tautan ke papan klip.
  const bagikan = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: produk.name, url })
        return
      }
      await navigator.clipboard.writeText(url)
      beriToast('Tautan produk disalin.', 'sukses')
    } catch {
      beriToast('Tautan produk: ' + url, 'info')
    }
  }

  const wa = (pengaturan?.whatsapp || '').replace(/[^0-9]/g, '').replace(/^0/, '62')
  const tautanTanya = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang ${produk.name} (${fmtRupiah(produk.price)}).`)}`
    : null

  // Tag/lencana ringkas, meniru baris "badge" di referensi.
  const tag = [
    produk.category?.name && { label: produk.category.name, Ikon: IconLabel },
    produk.drug_class_label && { label: produk.drug_class_label, Ikon: IconInfo },
    { label: `Satuan ${produk.unit}`, Ikon: IconPenggaris },
    { label: habis ? 'Stok habis' : `Tersedia ${produk.stock}`, Ikon: IconCentangBulat },
  ].filter(Boolean)

  const keteranganSingkat = produk.description || 'Belum ada keterangan tambahan untuk produk ini.'
  const keteranganPanjang = keteranganSingkat.length > 120
  const keteranganTampil = !keteranganPanjang || bukaKeterangan ? keteranganSingkat : `${keteranganSingkat.slice(0, 120)}...`

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      {/* ============ REMAH ROTI ============ */}
      <nav aria-label="Remah roti" className="flex flex-wrap items-center gap-1 text-[14.5px] text-secondary">
        <button type="button" onClick={() => nav('/')} className="hover:text-accent">Beranda</button>
        <IconPanahKanan size={15} className="text-muted" />
        <button type="button" onClick={() => nav('/toko')} className="hover:text-accent">Toko</button>
        {produk.category?.name && (
          <>
            <IconPanahKanan size={15} className="text-muted" />
            <button
              type="button"
              onClick={() => nav(`/toko?kategori=${produk.category.slug}`)}
              className="hover:text-accent"
            >
              {produk.category.name}
            </button>
          </>
        )}
        <IconPanahKanan size={15} className="text-muted" />
        <span className="truncate font-medium text-primary" aria-current="page">{produk.name}</span>
      </nav>

      {/* ============ UTAMA: galeri + informasi ============ */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* --- Galeri gambar --- */}
        <div className="flex flex-col gap-4">
          <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[var(--radius-shell)] border border-hairline permukaan-1 text-accent">
            {gambar.length > 0 && (
              <img
                key={indeksGambar}
                src={gambar[indeksGambar]}
                alt={produk.name}
                className="h-full w-full object-cover"
              />
            )}
            {!habis && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/85 px-3 py-1 text-[12.5px] font-semibold text-emerald-50 backdrop-blur-sm">
                <IconJam size={13} weight="bold" />
                Siap dikirim hari ini
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {gambar.length > 1 &&
                gambar.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndeksGambar(i)}
                    aria-label={`Lihat gambar ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      indeksGambar === i ? 'bg-accent' : 'bg-[var(--border-strong)] hover:bg-[var(--text-muted)]'
                    }`}
                  />
                ))}
            </div>
            <Tombol variant="secondary" size="sm" onClick={() => nav(produk.category ? `/toko?kategori=${produk.category.slug}` : '/toko')}>
              <IconKamera size={17} weight="bold" />
              Cari yang serupa
            </Tombol>
          </div>
        </div>

        {/* --- Informasi produk --- */}
        <div className="flex flex-col">
          {/* Tombol favorit & bagikan */}
          <div className="mb-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={simpanFavorit}
              aria-label={favorit ? `Hapus ${produk.name} dari favorit` : `Simpan ${produk.name} ke favorit`}
              aria-pressed={favorit}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                favorit
                  ? 'border-[var(--color-signal-rose)] bg-[var(--color-signal-rose-soft)] text-[var(--color-signal-rose)]'
                  : 'border-hairline surface-raised text-secondary hover:text-[var(--color-signal-rose)]'
              }`}
            >
              <IconHati size={21} weight={favorit ? 'fill' : 'regular'} />
            </button>
            <button
              type="button"
              onClick={bagikan}
              aria-label="Bagikan produk ini"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline surface-raised text-secondary transition-colors hover:text-accent"
            >
              <IconBagikan size={20} weight="bold" />
            </button>
          </div>

          <h1 className="text-[26px] font-medium leading-tight tracking-tight text-heading sm:text-[32px]">
            {produk.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="numeric text-[32px] font-bold leading-none text-primary">{fmtRupiah(produk.price)}</span>
            <span className="text-[15.5px] text-secondary">/ {produk.unit}</span>
          </div>

          {/* Lencana status: resep / stok */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
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

          {/* Peringatan resep */}
          {!boleh && (
            <p className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-amber-soft)] px-4 py-3.5 text-[15.5px] leading-relaxed text-[var(--color-signal-amber)]">
              <IconPeringatan size={20} weight="bold" className="mt-0.5 shrink-0" />
              <span>
                Produk ini memerlukan resep dokter/bidan. Unggah resep Anda saat checkout, lalu apotek
                akan memverifikasinya sebelum pesanan diproses.
              </span>
            </p>
          )}

          {/* Jumlah + subtotal */}
          {!habis && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[16.5px] font-semibold text-primary">Jumlah</span>
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
            </div>
          )}

          {/* Tombol tindakan: beli sekarang + tanya apoteker */}
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Tombol size="lg" className="flex-1" disabled={habis} onClick={() => tambah(true)}>
              <IconKeranjang size={20} weight="bold" />
              Beli Sekarang
            </Tombol>
            {tautanTanya ? (
              <a
                href={tautanTanya}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-strong px-5 text-[17px] font-semibold text-primary transition-colors hover:surface-hover"
              >
                <IconKirimPesan size={19} weight="bold" />
                Tanya Apoteker
              </a>
            ) : (
              <Tombol variant="secondary" size="lg" className="flex-1" disabled={habis} onClick={() => tambah(false)}>
                <IconKeranjang size={20} weight="bold" />
                Tambah ke Keranjang
              </Tombol>
            )}
          </div>

          {/* Tag / lencana */}
          <div className="mt-6 flex flex-wrap gap-2">
            {tag.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline surface-sunken px-3 py-1.5 text-[13.5px] font-medium text-secondary"
              >
                <t.Ikon size={14} weight="bold" className="text-accent" />
                {t.label}
              </span>
            ))}
          </div>

          {/* Keterangan */}
          <p className="mt-6 text-[16.5px] leading-relaxed text-secondary">
            {keteranganTampil}
            {keteranganPanjang && (
              <button
                type="button"
                onClick={() => setBukaKeterangan((v) => !v)}
                className="ml-2 font-semibold text-accent hover:underline"
              >
                {bukaKeterangan ? 'Sembunyikan' : 'Baca selengkapnya'}
              </button>
            )}
          </p>

          {/* Info penjual (apotek) */}
          <div className="mt-8 border-t border-hairline pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-[17px] font-bold text-emerald-50">
                  PM
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[16.5px] font-semibold text-primary">{namaKlinik}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-[14px] text-secondary">
                    <IconTerverifikasi size={15} className="text-accent" />
                    Apoteker berwenang · obat asli &amp; bersegel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => nav('/toko')}
                className="text-[15px] font-semibold text-accent hover:underline"
              >
                Lihat semua produk &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STOK HABIS ============ */}
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

      {/* ============ KETERANGAN LENGKAP ============ */}
      <Kartu className="space-y-3">
        <h2 className="text-[18.5px] font-semibold tracking-tight text-primary">Informasi Produk</h2>

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

        {produk.description && (
          <p className="border-t border-hairline pt-3 text-[16px] leading-relaxed text-secondary">
            {produk.description}
          </p>
        )}
      </Kartu>

      {/* ============ PRODUK SERUPA ============ */}
      {terkait.length > 0 && (
        <section>
          <h2 className="mb-3 text-[19px] font-semibold tracking-tight text-heading">
            Mungkin Anda juga suka
          </h2>
          <ul className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {terkait.slice(0, 4).map((p) => (
              <li key={p.id} className="reveal">
                <Kartu padat className="h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <button
                    type="button"
                    onClick={() => nav(`/produk/${p.slug}`)}
                    className="flex h-full w-full flex-col text-left"
                  >
                    <span className="flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden permukaan-1 text-accent">
                      <img src={gambarProduk(p)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 p-3.5">
                      <span className="line-clamp-2 text-[15.5px] font-semibold leading-snug text-primary">{p.name}</span>
                      <span className="numeric mt-auto text-[16px] font-bold text-primary">{fmtRupiah(p.price)}</span>
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
