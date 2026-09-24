// =============================================================
// Kartu bersama aplikasi pasien (e-commerce).
//
// Semua kartu mematuhi aturan yang sama:
// - Informasi penting di atas, tindakan utama jelas, tidak ada
//   tombol yang hanya berupa ikon.
// - Status selalu ikon + teks, tidak pernah warna saja.
// - Target sentuh minimal 44px.
// =============================================================
import { fmtRupiah, fmtTanggal } from '../../../shared/format'
import { Kartu, Lencana, Tombol, BarisInfo } from './ui'
import { statusPesanan, statusBayar, labelMetodeBayar } from '../lib/status'
import {
  IconProduk, IconPeringatan, IconKeranjang, IconPesanan,
  IconTanggal, IconKirim, IconLokasi, IconObat,
} from './Icons'

// -------------------------------------------------------------
// Kartu produk. Tombol selalu bertuliskan "Tambah", bukan ikon saja.
//
// Dua bentuk:
//   (bawaan)  mendatar - nyaman di ponsel selebar satu kolom.
//   ringkas   tegak    - untuk grid multi-kolom di layar besar.
// -------------------------------------------------------------
export function KartuProduk({ produk, onBuka, onTambah, boleh = true, jumlahDiKeranjang = 0, ringkas = false, className = '' }) {
  const habis = !produk.in_stock || produk.stock <= 0
  const perluResep = produk.requires_prescription && !boleh

  if (ringkas) {
    return (
      <Kartu padat className={`flex h-full flex-col ${className}`}>
        <button
          type="button"
          onClick={() => onBuka?.(produk)}
          aria-label={`Lihat detail ${produk.name}`}
          className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-t-[var(--radius-card)] permukaan-1 text-accent"
        >
          {produk.image ? (
            <img src={produk.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <IconProduk size={40} />
          )}
        </button>

        <div className="flex flex-1 flex-col p-4">
          <button type="button" onClick={() => onBuka?.(produk)} className="text-left">
            <span className="line-clamp-2 block text-[17px] font-semibold leading-snug text-primary">
              {produk.name}
            </span>
          </button>

          {produk.requires_prescription && (
            <span className="mt-1.5 inline-flex">
              <Lencana tone="amber" ikon={<IconPeringatan size={13} weight="bold" />}>
                Perlu resep
              </Lencana>
            </span>
          )}

          <span className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="numeric text-[18.5px] font-bold text-primary">{fmtRupiah(produk.price)}</span>
            <span className="text-[15px] text-secondary">/ {produk.unit}</span>
          </span>
          <span className="mt-1 block text-[15px] font-medium">
            {habis ? (
              <span className="text-[var(--color-signal-rose)]">Stok habis</span>
            ) : (
              <span className="numeric text-[var(--color-signal-green)]">
                Tersedia {produk.stock} {produk.unit}
              </span>
            )}
          </span>

          <div className="mt-auto pt-3.5">
            <Tombol
              variant={!habis && !perluResep ? 'primary' : 'secondary'}
              penuh
              disabled={habis || perluResep}
              onClick={() => onTambah?.(produk)}
              aria-label={`Tambah ${produk.name} ke keranjang`}
            >
              <IconKeranjang size={19} weight="bold" />
              {habis ? 'Stok Habis' : jumlahDiKeranjang > 0 ? `Tambah Lagi (${jumlahDiKeranjang})` : 'Tambah'}
            </Tombol>
          </div>
        </div>
      </Kartu>
    )
  }

  return (
    <Kartu padat className={className}>
      <div className="flex items-start gap-3.5 px-4 pt-4">
        <button
          type="button"
          onClick={() => onBuka?.(produk)}
          aria-label={`Lihat detail ${produk.name}`}
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] permukaan-1 text-accent"
        >
          {produk.image ? (
            <img src={produk.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <IconProduk size={28} />
          )}
        </button>

        <button
          type="button"
          onClick={() => onBuka?.(produk)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-[18px] font-semibold leading-snug text-primary">
            {produk.name}
          </span>
          {produk.requires_prescription && (
            <span className="mt-1.5 inline-flex">
              <Lencana tone="amber" ikon={<IconPeringatan size={13} weight="bold" />}>
                Perlu resep
              </Lencana>
            </span>
          )}
          <span className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="numeric text-[18.5px] font-bold text-primary">{fmtRupiah(produk.price)}</span>
            <span className="text-[15px] text-secondary">/ {produk.unit}</span>
          </span>
          <span className="mt-1.5 block text-[15px] font-medium">
            {habis ? (
              <span className="text-[var(--color-signal-rose)]">Stok habis</span>
            ) : (
              <span className="numeric text-[var(--color-signal-green)]">
                Tersedia {produk.stock} {produk.unit}
              </span>
            )}
          </span>
        </button>
      </div>

      <div className="px-4 pb-4 pt-3">
        <Tombol
          variant={!habis && !perluResep ? 'primary' : 'secondary'}
          penuh
          disabled={habis || perluResep}
          onClick={() => onTambah?.(produk)}
          aria-label={`Tambah ${produk.name} ke keranjang`}
        >
          <IconKeranjang size={19} weight="bold" />
          {habis ? 'Stok Habis' : jumlahDiKeranjang > 0 ? `Tambah Lagi (${jumlahDiKeranjang})` : 'Tambah ke Keranjang'}
        </Tombol>
      </div>

      {perluResep && (
        <p className="border-t border-hairline px-4 py-3 text-[15px] leading-relaxed text-[var(--color-signal-amber)]">
          Perlu resep dokter/bidan untuk membeli produk ini.
        </p>
      )}
    </Kartu>
  )
}

// -------------------------------------------------------------
// Kartu pesanan. Status memakai bahasa sehari-hari dan diberi ikon,
// jadi tidak bergantung pada warna saja.
// -------------------------------------------------------------
export function KartuPesanan({ pesanan, onDetail, className = '' }) {
  const status = statusPesanan(pesanan)
  const jumlahItem = pesanan.items_count ?? (pesanan.items || []).reduce((s, d) => s + (d.qty || 0), 0)

  return (
    <Kartu className={`space-y-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="numeric text-[15.5px] text-secondary">{pesanan.order_number}</p>
          <p className="mt-0.5 text-[17px] font-semibold text-primary">
            {jumlahItem} produk · {fmtRupiah(pesanan.grand_total)}
          </p>
        </div>
        <Lencana tone={status.tone}>{status.label}</Lencana>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15.5px] text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <IconTanggal size={16} className="text-muted" />
          <span className="numeric">{fmtTanggal(pesanan.created_at)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconPesanan size={16} className="text-muted" />
          {labelMetodeBayar(pesanan.payment_method)}
        </span>
      </div>

      {pesanan.status === 'pending_payment' && (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-signal-amber-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-amber)]">
          Pesanan ini belum dibayar. Buka detail untuk menyelesaikan pembayaran.
        </p>
      )}

      {onDetail && (
        <Tombol variant="secondary" penuh onClick={() => onDetail(pesanan)}>
          Lihat Detail Pesanan
        </Tombol>
      )}
    </Kartu>
  )
}

// -------------------------------------------------------------
// Baris obat di dalam rincian pesanan.
// -------------------------------------------------------------
export function BarisObat({ nama, dosis, aturan, jumlah, satuan, harga }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] permukaan-1 text-accent">
        <IconObat size={22} weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold leading-snug text-primary">{nama}</p>
        {dosis && <p className="mt-0.5 text-[15.5px] text-secondary">Dosis: {dosis}</p>}
        {aturan && <p className="mt-0.5 text-[15.5px] leading-relaxed text-secondary">{aturan}</p>}
        {jumlah != null && (
          <p className="numeric mt-0.5 text-[15.5px] text-secondary">
            Jumlah: {jumlah} {satuan || ''}
          </p>
        )}
      </div>
      {harga != null && (
        <span className="numeric shrink-0 text-[16px] font-semibold text-primary">{fmtRupiah(harga)}</span>
      )}
    </div>
  )
}

// Baris ringkas untuk rincian pesanan (nama, nilai, harga).
export function BarisRincian({ label, nilai, tebal, className = '' }) {
  return (
    <BarisInfo label={label} className={className}>
      <span className={tebal ? 'numeric text-[18px] font-bold text-primary' : 'numeric'}>{nilai}</span>
    </BarisInfo>
  )
}
