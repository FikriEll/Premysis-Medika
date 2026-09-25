import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { gambarProduk } from '../lib/gambar'
import { Kartu, Tombol, Kosong, PengaturJumlah, TombolIkon, JudulSeksi, BarisInfo } from '../components/ui'
import { IconHapus, IconToko, IconPeringatan } from '../components/Icons'
import { IlustrasiKeranjang } from '../components/Ilustrasi'

// F-08 Keranjang.
//
// Struktur: daftar barang (nama, jumlah, harga), pengatur -1/+1,
// subtotal, biaya lain bila ada, total, lalu satu tombol besar
// "Lanjutkan Pembayaran". Keranjang disimpan di server, jadi isinya
// sama di semua perangkat pasien.
export default function Keranjang() {
  const nav = useNavigate()
  const { itemKeranjang, subtotal, setJumlahKeranjang, hapusDariKeranjang, beriToast } = useStore()

  const ubahJumlah = async (x, delta) => {
    const baru = x.qty + delta
    try {
      if (baru < 1) {
        await hapusDariKeranjang(x.id)
        beriToast('Barang dihapus dari keranjang.', 'info')
        return
      }
      await setJumlahKeranjang(x.id, baru)
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  const hapus = async (x) => {
    try {
      await hapusDariKeranjang(x.id)
      beriToast('Barang dihapus dari keranjang.', 'info')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  if (itemKeranjang.length === 0) {
    return (
      <Kartu padat>
        <Kosong
          judul="Keranjang masih kosong"
          pesan="Belum ada barang di keranjang Anda. Tambahkan obat atau produk kesehatan dari halaman Toko."
          ilustrasi={<IlustrasiKeranjang size={140} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/toko')}>
              Belanja Sekarang
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  const jumlahBarang = itemKeranjang.reduce((s, x) => s + x.qty, 0)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ul className="space-y-3">
        {itemKeranjang.map((x) => {
          const p = x.product
          if (!p) return null
          return (
            <li key={x.id}>
              <Kartu className="space-y-3.5">
                <div className="flex items-start gap-4">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] permukaan-1 text-accent">
                    <img src={gambarProduk(p)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[18px] font-semibold leading-snug text-primary">{p.name}</p>
                    <p className="numeric mt-1 text-[16px] text-secondary">
                      {fmtRupiah(p.price)} / {p.unit}
                    </p>
                    {p.requires_prescription && (
                      <p className="mt-1 text-[15px] font-medium text-[var(--color-signal-amber)]">
                        Produk resep
                      </p>
                    )}
                  </div>
                  <TombolIkon label={`Hapus ${p.name} dari keranjang`} onClick={() => hapus(x)}>
                    <IconHapus size={20} />
                  </TombolIkon>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3.5">
                  <PengaturJumlah
                    nilai={x.qty}
                    min={1}
                    max={p.stock}
                    onKurang={() => ubahJumlah(x, -1)}
                    onTambah={() => ubahJumlah(x, 1)}
                  />
                  <p className="numeric text-[18.5px] font-bold text-primary">
                    {fmtRupiah(x.subtotal ?? p.price * x.qty)}
                  </p>
                </div>

                {x.qty > p.stock && (
                  <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-rose)]">
                    <IconPeringatan size={17} weight="bold" className="mt-0.5 shrink-0" />
                    <span>
                      Jumlah melebihi stok tersedia ({p.stock} {p.unit}). Kurangi dulu sebelum melanjutkan.
                    </span>
                  </p>
                )}
              </Kartu>
            </li>
          )
        })}
      </ul>

      {/* Ringkasan biaya - menempel saat menggulir di layar besar */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <Kartu>
          <JudulSeksi>Ringkasan Pesanan</JudulSeksi>
          <BarisInfo label="Jumlah barang">
            <span className="numeric">{jumlahBarang}</span>
          </BarisInfo>
          <BarisInfo label="Subtotal">
            <span className="numeric">{fmtRupiah(subtotal)}</span>
          </BarisInfo>
          <BarisInfo label="Ongkos kirim" className="border-t border-hairline">
            <span className="text-[16px] text-secondary">Dihitung di langkah berikutnya</span>
          </BarisInfo>
        </Kartu>

        <div className="space-y-2.5">
          <Tombol size="lg" penuh onClick={() => nav('/checkout')}>
            Lanjutkan Pembayaran
          </Tombol>
          <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/toko')}>
            <IconToko size={20} weight="bold" />
            Lanjut Belanja
          </Tombol>
        </div>
      </div>
    </div>
  )
}
