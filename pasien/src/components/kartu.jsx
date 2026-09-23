// =============================================================
// Kartu bersama aplikasi pasien (brief §25).
//
// Semua kartu di sini mematuhi aturan yang sama:
// - Informasi penting di atas, tindakan utama jelas, tidak ada
//   tombol yang hanya berupa ikon.
// - Status selalu ikon + teks (brief §22), tidak pernah warna saja.
// - Target sentuh minimal 44px.
// =============================================================
import { fmtRupiah, fmtTanggal, fmtTanggalPanjang, statusPesanan, statusAppointment , fmtJam } from '../../../shared/format'
import { Kartu, Lencana, Tombol, BarisInfo } from './ui'
import { cariTenaga } from '../lib/layanan'
import {
  IconJam, IconLokasi, IconPanahKanan, IconPesanan, IconProduk,
  IconPeringatan, IconKeranjang, IconCatatan, IconTanggal, IconObat,
} from './Icons'

// -------------------------------------------------------------
// Kartu janji temu (brief §7 kartu besar, §9 detail).
// `ringkas` dipakai di Beranda (tanpa tombol), `penuh` di daftar.
// -------------------------------------------------------------
export function KartuJanji({ janji, onDetail, className = '' }) {
  if (!janji) return null
  const tenaga = cariTenaga(janji.id_bidan)
  const status = statusAppointment[janji.status] || { tone: 'neutral' }

  return (
    <Kartu className={`space-y-3.5 ${className}`}>
      {/* flex-wrap + min-w pada blok nama:
          di layar 360px, "Pemeriksaan Kehamilan" butuh ~101px tetapi
          hanya mendapat 97px karena lencana status memakan ruang, sehingga
          kata terpanjang keluar batas (brief §26 melarang teks overflow).
          Dengan lebar minimum 11rem, flex-wrap menurunkan lencana ke baris
          berikutnya pada layar sempit, sementara di layar lebih lebar
          lencana tetap di kanan seperti biasa. */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-[11rem] flex-1">
          <p className="text-[18.5px] font-bold leading-snug tracking-tight text-primary">
            {janji.jenis_layanan}
          </p>
          <p className="mt-1 text-[16px] text-secondary">
            {tenaga ? `Bersama ${tenaga.profesi} ${tenaga.nama.split(',')[0]}` : 'Bersama tenaga klinik'}
          </p>
        </div>
        <Lencana tone={status.tone}>{janji.status}</Lencana>
      </div>

      {/* Waktu ditampilkan besar: ini informasi yang paling sering
          dicari pasien saat mau berangkat ke klinik. */}
      <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3">
        <p className="text-[17px] font-semibold leading-snug text-primary">
          {fmtTanggalPanjang(janji.tanggal)}
        </p>
        <p className="numeric mt-1 flex items-center gap-1.5 text-[17px] font-bold text-accent">
          <IconJam size={18} weight="bold" />
          Pukul {fmtJam(janji.waktu)} WIB
        </p>
      </div>

      {janji.keluhan && (
        <p className="flex items-start gap-2 text-[15.5px] leading-relaxed text-secondary">
          <IconCatatan size={16} className="mt-0.5 shrink-0 text-muted" />
          <span>{janji.keluhan}</span>
        </p>
      )}

      {janji.catatan && (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-signal-blue-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-blue)]">
          Pesan klinik: {janji.catatan}
        </p>
      )}

      {onDetail && (
        <Tombol variant="secondary" penuh onClick={() => onDetail(janji)}>
          Lihat Detail Janji Temu
        </Tombol>
      )}
    </Kartu>
  )
}

// -------------------------------------------------------------
// Kartu produk (brief §10, §11).
// Tombol selalu bertuliskan "Tambah", bukan ikon keranjang saja.
// -------------------------------------------------------------
export function KartuProduk({ produk, onBuka, onTambah, boleh, jumlahDiKeranjang = 0, className = '' }) {
  const habis = produk.stok <= 0 || produk.status !== 'Aktif'

  // Tata letak BERTUMPUK, bukan mendatar.
  //
  // Percobaan pertama memakai tombol "Tambah" di samping nama produk.
  // Diuji di lebar 360px, ruang untuk nama produk hanya tersisa 85px
  // sehingga "Amoxicillin 500mg" (butuh 116px) terpotong - brief §26
  // melarang teks overflow, dan brief §1 meminta informasi penting
  // langsung terlihat. Karena itu nama produk kini dapat lebar penuh,
  // dan tombol "Tambah" turun ke bawah dengan ukuran penuh.
  return (
    <Kartu padat className={className}>
      <div className="flex items-start gap-3.5 px-4 pt-4">
        {/* Foto produk: ilustrasi sederhana karena katalog demo belum
            punya foto asli. Ukuran tetap supaya baris sejajar. */}
        <button
          type="button"
          onClick={() => onBuka?.(produk)}
          aria-label={`Lihat detail ${produk.nama}`}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-control)] permukaan-1 text-accent"
        >
          <IconProduk size={28} />
        </button>

        <button
          type="button"
          onClick={() => onBuka?.(produk)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-[18px] font-semibold leading-snug text-primary">
            {produk.nama}
          </span>
          {produk.wajib_resep && (
            <span className="mt-1.5 inline-flex">
              <Lencana tone="amber" ikon={<IconPeringatan size={13} weight="bold" />}>
                Perlu resep
              </Lencana>
            </span>
          )}
          <span className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="numeric text-[18.5px] font-bold text-primary">{fmtRupiah(produk.harga)}</span>
            <span className="text-[15px] text-secondary">/ {produk.satuan}</span>
          </span>
          <span className="mt-1.5 block text-[15px] font-medium">
            {habis ? (
              <span className="text-[var(--color-signal-rose)]">Stok habis</span>
            ) : produk.stok <= produk.stok_minimum ? (
              <span className="numeric text-[var(--color-signal-amber)]">
                Sisa {produk.stok} {produk.satuan}
              </span>
            ) : (
              <span className="numeric text-[var(--color-signal-green)]">
                Tersedia {produk.stok} {produk.satuan}
              </span>
            )}
          </span>
        </button>
      </div>

      <div className="px-4 pb-4 pt-3">
        <Tombol
          variant={boleh && !habis ? 'primary' : 'secondary'}
          penuh
          disabled={!boleh || habis}
          onClick={() => onTambah?.(produk)}
          aria-label={`Tambah ${produk.nama} ke keranjang`}
        >
          <IconKeranjang size={19} weight="bold" />
          {habis ? 'Stok Habis' : jumlahDiKeranjang > 0 ? `Tambah Lagi (${jumlahDiKeranjang} di keranjang)` : 'Tambah ke Keranjang'}
        </Tombol>
      </div>

      {!boleh && (
        <p className="border-t border-hairline px-4 py-3 text-[15px] leading-relaxed text-[var(--color-signal-amber)]">
          Perlu resep aktif dari bidan untuk membeli produk ini.
        </p>
      )}
    </Kartu>
  )
}

// -------------------------------------------------------------
// Kartu pesanan (brief §14). Status memakai bahasa sehari-hari dan
// diberi ikon, jadi tidak bergantung pada warna saja.
// -------------------------------------------------------------
export function KartuPesanan({ pesanan, onDetail, className = '' }) {
  const status = statusPesanan[pesanan.status] || { tone: 'neutral' }
  const jumlahItem = (pesanan.detail || []).reduce((s, d) => s + d.jumlah, 0)

  return (
    <Kartu className={`space-y-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="numeric text-[15.5px] text-secondary">{pesanan.nomor_pesanan}</p>
          <p className="mt-0.5 text-[17px] font-semibold text-primary">
            {jumlahItem} produk · {fmtRupiah(pesanan.total)}
          </p>
        </div>
        <Lencana tone={status.tone}>{status.label}</Lencana>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15.5px] text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <IconTanggal size={16} className="text-muted" />
          <span className="numeric">{fmtTanggal(pesanan.waktu_pemesanan)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconPesanan size={16} className="text-muted" />
          {pesanan.metode_ambil === 'Dikirim' ? 'Kirim ke alamat' : 'Ambil di klinik'}
        </span>
      </div>

      {pesanan.status === 'Menunggu Pembayaran' && pesanan.metode_bayar !== 'Tunai' && (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-signal-amber-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-amber)]">
          {pesanan.status_pembayaran === 'Menunggu Verifikasi'
            ? 'Bukti pembayaran sedang diperiksa klinik.'
            : pesanan.status_pembayaran === 'Ditolak'
              ? 'Bukti pembayaran ditolak. Silakan buka detail untuk mengunggah ulang.'
              : 'Pesanan ini belum dibayar. Buka detail untuk menyelesaikan pembayaran.'}
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
// Baris obat di dalam resep / rincian pesanan.
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

// Baris ringkas untuk rincian pesanan (nama, jumlah, harga).
export function BarisRincian({ label, nilai, tebal, className = '' }) {
  return (
    <BarisInfo label={label} className={className}>
      <span className={tebal ? 'numeric text-[18px] font-bold text-primary' : 'numeric'}>{nilai}</span>
    </BarisInfo>
  )
}

export { IconPanahKanan, IconLokasi }
