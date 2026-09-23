import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { Kartu, Tombol, Lencana, Kosong, PengaturJumlah, BarisInfo } from '../components/ui'
import {
  IconProduk, IconKeranjang, IconPeringatan, IconInfo, IconObat, IconToko,
} from '../components/Icons'

// F-08 Detail Produk - brief §11.
//
// Brief §11: "Jangan membuat pasien harus membaca paragraf panjang
// untuk membeli produk." Karena itu urutannya:
//   1. gambar + nama + harga (paling penting)
//   2. tombol Tambah ke Keranjang + jumlah
//   3. baru keterangan tambahan di bawah.
//
// Soal "kegunaan" dan "aturan penggunaan" (brief §11): brief hanya
// meminta menampilkan keduanya BILA informasi itu tersedia dan sudah
// diverifikasi klinik. Katalog demo tidak menyimpan kolom itu, jadi
// informasi aturan pakai diambil dari resep aktif pasien (satu-satunya
// sumber yang memang diverifikasi bidan). Tidak ada info medis yang
// dikarang di halaman ini.
export default function DetailProduk() {
  const { id } = useParams()
  const nav = useNavigate()
  const { cariProduk, cariKategori, tambahKeranjang, bolehBeli, beriToast, resepSaya } = useStore()
  const [jumlah, setJumlah] = useState(1)

  const p = cariProduk(Number(id))

  if (!p) {
    return (
      <Kartu padat>
        <Kosong
          judul="Produk tidak ditemukan"
          pesan="Produk ini mungkin sudah tidak dijual lagi."
          ikon={<IconProduk size={24} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/toko', { replace: true })}>
              Kembali ke Daftar Obat
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  const habis = p.stok <= 0 || p.status !== 'Aktif'
  const boleh = bolehBeli(p)

  // Aturan pakai dari resep aktif yang memuat produk ini, jika ada.
  const aturanResep = resepSaya
    .filter((r) => r.status === 'Aktif')
    .flatMap((r) => r.detail || [])
    .find((d) => d.id_produk === p.id)

  const tambah = () => {
    tambahKeranjang(p.id, jumlah)
    beriToast(`${jumlah} ${p.satuan} ${p.nama} masuk keranjang.`, 'sukses')
    nav('/keranjang')
  }

  return (
    <div className="space-y-5">
      {/* --- Bagian utama: gambar, nama, harga --- */}
      <Kartu className="space-y-4">
        <div className="flex h-44 items-center justify-center rounded-[var(--radius-control)] permukaan-1 text-accent">
          <IconProduk size={68} weight="bold" />
        </div>

        <div>
          <h1 className="text-[23px] font-bold leading-snug tracking-tight text-primary">{p.nama}</h1>
          <p className="mt-1 text-[16px] text-secondary">{cariKategori(p.id_kategori)?.nama}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="numeric text-[28px] font-bold leading-none text-primary">{fmtRupiah(p.harga)}</p>
          <p className="text-[16px] text-secondary">per {p.satuan}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {p.wajib_resep && (
            <Lencana tone="amber" ikon={<IconPeringatan size={14} weight="bold" />}>
              Perlu resep
            </Lencana>
          )}
          {habis ? (
            <Lencana tone="rose">Stok habis</Lencana>
          ) : (
            <Lencana tone="green">
              <span className="numeric">Tersedia {p.stok} {p.satuan}</span>
            </Lencana>
          )}
        </div>
      </Kartu>

      {/* --- Peringatan resep, kalau perlu --- */}
      {!boleh && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-amber-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-amber)]">
          <IconPeringatan size={20} weight="bold" className="mt-0.5 shrink-0" />
          <span>
            Produk ini memerlukan resep bidan. Minta bidan menerbitkan resep terlebih dahulu, lalu
            Anda dapat membelinya dari menu Resep Obat.
          </span>
        </p>
      )}

      {/* --- Tindakan utama --- */}
      {boleh && !habis && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[17px] font-semibold text-primary">Jumlah</span>
            <PengaturJumlah
              nilai={jumlah}
              min={1}
              max={p.stok}
              onKurang={() => setJumlah((n) => Math.max(1, n - 1))}
              onTambah={() => setJumlah((n) => Math.min(p.stok, n + 1))}
            />
          </div>

          <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
            <BarisInfo label="Subtotal" className="py-1">
              <span className="numeric text-[20.5px] font-bold text-primary">
                {fmtRupiah(p.harga * jumlah)}
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
            pesan="Silakan hubungi klinik untuk menanyakan ketersediaan produk ini."
            ikon={<IconInfo size={24} />}
            aksi={
              <Tombol size="lg" variant="secondary" onClick={() => nav('/toko')}>
                Lihat Produk Lain
              </Tombol>
            }
          />
        </Kartu>
      )}

      {/* --- Keterangan tambahan (prioritas paling bawah) --- */}
      <Kartu className="space-y-3">
        <h2 className="text-[18.5px] font-semibold tracking-tight text-primary">Keterangan</h2>
        <p className="text-[17px] leading-relaxed text-secondary">{p.deskripsi}</p>

        {aturanResep && (
          <div className="space-y-1.5 rounded-[var(--radius-control)] border border-hairline px-4 py-3.5">
            <p className="text-[16px] font-semibold text-primary">Aturan pakai dari resep Anda</p>
            <p className="text-[16px] leading-relaxed text-secondary">
              Dosis: {aturanResep.dosis}
            </p>
            {aturanResep.aturan_pakai && (
              <p className="text-[16px] leading-relaxed text-secondary">{aturanResep.aturan_pakai}</p>
            )}
          </div>
        )}

        <div className="divide-y divide-[var(--border-hairline)]">
          <BarisInfo label="Kategori">{cariKategori(p.id_kategori)?.nama}</BarisInfo>
          <BarisInfo label="Satuan">{p.satuan}</BarisInfo>
          <BarisInfo label="Ketersediaan">
            <span className="numeric">{habis ? 'Habis' : `${p.stok} ${p.satuan}`}</span>
          </BarisInfo>
        </div>
      </Kartu>

      <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/toko')}>
        <IconToko size={20} weight="bold" />
        Kembali ke Daftar Obat
      </Tombol>
    </div>
  )
}
