import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { Kartu, Tombol, Kosong, PengaturJumlah, TombolIkon, JudulSeksi, BarisInfo } from '../components/ui'
import { IconHapus, IconToko, IconProduk, IconPeringatan } from '../components/Icons'
import { IlustrasiKeranjang } from '../components/Ilustrasi'

// F-08 Keranjang - brief §12.
//
// Struktur halaman persis seperti brief: daftar barang (nama, jumlah,
// harga), pengatur - 1 +, subtotal, biaya lain bila ada, total, lalu
// satu tombol besar "Lanjutkan Pembayaran".
//
// Validasi stok di sini hanya PERINGATAN; penegakannya tetap di
// server saat checkout (BR-04) supaya tidak bisa dilewati.
export default function Keranjang() {
  const nav = useNavigate()
  const { itemKeranjang, subtotal, setJumlahKeranjang, hapusDariKeranjang, beriToast } = useStore()

  const adaMasalah = itemKeranjang.some((x) => x.jumlah > x.produk.stok || x.produk.status !== 'Aktif')

  const ubahJumlah = (x, delta) => {
    const baru = x.jumlah + delta
    if (baru < 1) {
      hapusDariKeranjang(x.id_produk)
      return
    }
    if (baru > x.produk.stok) {
      beriToast(`Stok ${x.produk.nama} hanya ${x.produk.stok} ${x.produk.satuan}.`, 'galat')
      return
    }
    setJumlahKeranjang(x.id_produk, baru)
  }

  if (itemKeranjang.length === 0) {
    return (
      <Kartu padat>
        <Kosong
          judul="Keranjang masih kosong"
          pesan="Belum ada barang di keranjang Anda. Tambahkan obat atau produk kesehatan dari daftar obat."
          ilustrasi={<IlustrasiKeranjang size={140} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/toko')}>
              Beli Obat
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-3">
        {itemKeranjang.map((x) => {
          const p = x.produk
          const lewat = x.jumlah > p.stok
          return (
            <li key={x.id_produk}>
              <Kartu className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-control)] permukaan-1 text-accent">
                    <IconProduk size={28} weight="bold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-semibold leading-snug text-primary">{p.nama}</p>
                    <p className="numeric mt-1 text-[16px] text-secondary">
                      {fmtRupiah(p.harga)} / {p.satuan}
                    </p>
                    {p.wajib_resep && (
                      <p className="mt-1 text-[15px] font-medium text-[var(--color-signal-amber)]">
                        Produk resep
                      </p>
                    )}
                  </div>
                  <TombolIkon label={`Hapus ${p.nama} dari keranjang`} onClick={() => hapusDariKeranjang(p.id)}>
                    <IconHapus size={20} />
                  </TombolIkon>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3.5">
                  <PengaturJumlah
                    nilai={x.jumlah}
                    min={1}
                    max={p.stok}
                    onKurang={() => ubahJumlah(x, -1)}
                    onTambah={() => ubahJumlah(x, 1)}
                  />
                  <p className="numeric text-[18.5px] font-bold text-primary">
                    {fmtRupiah(p.harga * x.jumlah)}
                  </p>
                </div>

                {lewat && (
                  <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-rose)]">
                    <IconPeringatan size={17} weight="bold" className="mt-0.5 shrink-0" />
                    <span>
                      Jumlah melebihi stok tersedia ({p.stok} {p.satuan}). Kurangi dulu sebelum melanjutkan.
                    </span>
                  </p>
                )}
              </Kartu>
            </li>
          )
        })}
      </ul>

      {/* Ringkasan biaya (brief §12) */}
      <Kartu>
        <JudulSeksi>Ringkasan Pesanan</JudulSeksi>
        <BarisInfo label="Jumlah barang">
          <span className="numeric">{itemKeranjang.reduce((s, x) => s + x.jumlah, 0)}</span>
        </BarisInfo>
        <BarisInfo label="Subtotal">
          <span className="numeric">{fmtRupiah(subtotal)}</span>
        </BarisInfo>
        <BarisInfo label="Ongkos kirim" className="border-t border-hairline">
          <span className="text-[16px] text-secondary">Dihitung di langkah berikutnya</span>
        </BarisInfo>
      </Kartu>

      {adaMasalah && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-rose-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
          <IconPeringatan size={20} weight="bold" className="mt-0.5 shrink-0" />
          <span>Perbaiki jumlah barang yang melebihi stok sebelum melanjutkan.</span>
        </p>
      )}

      <div className="space-y-2.5">
        <Tombol size="lg" penuh disabled={adaMasalah} onClick={() => nav('/checkout')}>
          Lanjutkan Pembayaran
        </Tombol>
        <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/toko')}>
          <IconToko size={20} weight="bold" />
          Lanjut Belanja
        </Tombol>
      </div>
    </div>
  )
}
