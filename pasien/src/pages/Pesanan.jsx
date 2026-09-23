import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah, fmtTanggal, statusPesanan, bolehDibatalkanPasien } from '../../../shared/format'
import { statusPembayaran } from '../../../shared/pembayaran'
import { Kartu, Tombol, Lencana, Kosong, Lembar, Konfirmasi, BarisInfo, JudulSeksi } from '../components/ui'
import { KartuPesanan, BarisObat } from '../components/kartu'
import LinimasaPesanan from '../components/Linimasa'
import { IconPesanan, IconLokasi, IconKirim, IconDompet, IconPeringatan, IconWhatsapp } from '../components/Icons'
import { IlustrasiPaket } from '../components/Ilustrasi'
import { KLINIK } from '../lib/layanan'

// F-09 Pesanan Saya - brief §14.
//
// Brief §14 menuntut status memakai bahasa yang mudah dimengerti:
//   Menunggu Pembayaran, Diproses, Siap Diambil, Selesai, Dibatalkan.
// Tidak boleh ada istilah teknis seperti Processing atau Pending.
// Label status diambil dari shared/format.js (satu sumber), jadi
// aplikasi pasien dan dashboard admin tidak pernah berbeda kata.
//
// Filter teks dihapus (sama seperti halaman janji temu): daftar
// dipisah menjadi "Pesanan Berjalan" dan "Pesanan Sebelumnya", dua
// kelompok yang tidak perlu dipelajari.
export default function Pesanan() {
  const nav = useNavigate()
  const loc = useLocation()
  const { pesananSaya, batalkanPesanan, namaProduk, beriToast } = useStore()
  const [detail, setDetail] = useState(null)
  const [batal, setBatal] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const AKTIF = ['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Siap Diambil', 'Dikirim']

  const berjalan = pesananSaya.filter((p) => AKTIF.includes(p.status))
  const selesai = pesananSaya.filter((p) => !AKTIF.includes(p.status))

  // Pesanan yang baru dibuat di-highlight dari halaman checkout.
  const sorot = loc.state?.sorot

  const lakukanBatal = async () => {
    setSibuk(true)
    try {
      await batalkanPesanan(batal.id)
      beriToast('Pesanan Anda sudah dibatalkan.', 'info')
      setBatal(null)
      setDetail(null)
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* --- Pesanan berjalan --- */}
      <section>
        <JudulSeksi>Pesanan Berjalan</JudulSeksi>
        {berjalan.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada pesanan"
              pesan="Pesanan yang Anda buat akan tampil di sini beserta statusnya."
              ilustrasi={<IlustrasiPaket size={136} />}
              aksi={
                <Tombol size="lg" onClick={() => nav('/toko')}>
                  Beli Obat
                </Tombol>
              }
            />
          </Kartu>
        ) : (
          <ul className="space-y-3">
            {berjalan.map((p) => (
              <li key={p.id}>
                <KartuPesanan
                  pesanan={p}
                  onDetail={() => setDetail(p)}
                  className={sorot === p.id ? 'border-2 border-[var(--accent)]' : ''}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Pesanan sebelumnya --- */}
      {selesai.length > 0 && (
        <section>
          <JudulSeksi>Pesanan Sebelumnya</JudulSeksi>
          <ul className="space-y-3">
            {selesai.map((p) => (
              <li key={p.id}>
                <KartuPesanan pesanan={p} onDetail={() => setDetail(p)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <a
        href={KLINIK.tautanWA('Halo, saya ingin menanyakan pesanan saya di Premysis Medika.')}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-3.5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
          <IconWhatsapp size={21} weight="bold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-primary">Ada pertanyaan soal pesanan?</span>
          <span className="block text-[15.5px] text-secondary">Hubungi klinik lewat WhatsApp</span>
        </span>
      </a>

      {/* --- Detail pesanan --- */}
      <Lembar
        buka={!!detail}
        onTutup={() => setDetail(null)}
        judul="Detail Pesanan"
        subjudul={detail?.nomor_pesanan}
        footer={
          detail ? (
            <div className="space-y-2.5">
              {detail.status === 'Menunggu Pembayaran' && detail.status_pembayaran !== 'Menunggu Verifikasi' && (
                <Tombol size="lg" penuh onClick={() => nav(`/pesanan/${detail.id}/bayar`)}>
                  <IconDompet size={20} weight="bold" />
                  {detail.metode_bayar === 'Tunai' ? 'Lihat Cara Bayar' : 'Bayar Sekarang'}
                </Tombol>
              )}
              {bolehDibatalkanPasien(detail.status) && (
                <Tombol variant="danger" size="lg" penuh onClick={() => setBatal(detail)}>
                  Batalkan Pesanan
                </Tombol>
              )}
              <Tombol variant="secondary" size="lg" penuh onClick={() => setDetail(null)}>
                Tutup
              </Tombol>
            </div>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] text-secondary">Status pesanan</span>
              <Lencana tone={statusPesanan[detail.status]?.tone}>{statusPesanan[detail.status]?.label}</Lencana>
            </div>

            {detail.metode_bayar !== 'Tunai' && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[16px] text-secondary">Status pembayaran</span>
                <Lencana tone={statusPembayaran[detail.status_pembayaran || 'Belum Bayar']?.tone}>
                  {statusPembayaran[detail.status_pembayaran || 'Belum Bayar']?.label}
                </Lencana>
              </div>
            )}

            {/* Lacak pesanan: perjalanan status langkah demi langkah */}
            <div className="rounded-[var(--radius-card)] border border-hairline px-4 py-4">
              <JudulSeksi>Lacak Pesanan</JudulSeksi>
              <LinimasaPesanan pesanan={detail} />
            </div>

            {/* Barang */}
            <div>
              <JudulSeksi>Barang yang dipesan</JudulSeksi>
              <div className="divide-y divide-[var(--border-hairline)]">
                {(detail.detail || []).map((d) => (
                  <BarisObat
                    key={d.id}
                    nama={namaProduk(d.id_produk)}
                    jumlah={d.jumlah}
                    harga={d.jumlah * d.harga_satuan}
                  />
                ))}
              </div>
            </div>

            {/* Cara terima & bayar */}
            <div className="rounded-[var(--radius-card)] border border-hairline px-4 py-1.5">
              <BarisInfo label="Cara terima">
                <span className="inline-flex items-center gap-1.5">
                  {detail.metode_ambil === 'Dikirim' ? (
                    <IconKirim size={17} className="text-muted" />
                  ) : (
                    <IconLokasi size={17} className="text-muted" />
                  )}
                  {detail.metode_ambil === 'Dikirim' ? 'Kirim ke Alamat' : 'Ambil di Klinik'}
                </span>
              </BarisInfo>
              {detail.metode_ambil === 'Dikirim' && detail.alamat_pengiriman && detail.alamat_pengiriman !== '-' && (
                <BarisInfo label="Alamat">{detail.alamat_pengiriman}</BarisInfo>
              )}
              <BarisInfo label="Cara bayar">
                <span className="inline-flex items-center gap-1.5">
                  <IconDompet size={17} className="text-muted" />
                  {detail.metode_bayar}
                </span>
              </BarisInfo>
              <BarisInfo label="Waktu pesan">
                <span className="numeric">{fmtTanggal(detail.waktu_pemesanan)}</span>
              </BarisInfo>
            </div>

            {/* Biaya. Catatan: `total` SUDAH termasuk ongkir, jadi
                subtotal dihitung dengan mengurangkan ongkir sekali saja. */}
            <div className="rounded-[var(--radius-card)] border border-hairline px-4 py-1.5">
              <BarisInfo label="Subtotal">
                <span className="numeric">{fmtRupiah(detail.total - (detail.biaya_kirim || 0))}</span>
              </BarisInfo>
              <BarisInfo label="Ongkos kirim">
                <span className="numeric">{detail.biaya_kirim ? fmtRupiah(detail.biaya_kirim) : 'Gratis'}</span>
              </BarisInfo>
              <BarisInfo label="Total bayar" className="border-t border-hairline">
                <span className="numeric text-[20.5px] font-bold text-accent">{fmtRupiah(detail.total)}</span>
              </BarisInfo>
            </div>

            {bolehDibatalkanPasien(detail.status) && (
              <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] surface-sunken px-4 py-3.5 text-[16px] leading-relaxed text-secondary">
                <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0 text-muted" />
                <span>
                  Pesanan masih menunggu pembayaran, jadi Anda dapat membatalkannya sendiri. Setelah
                  pembayaran dikonfirmasi klinik, pembatalan hanya bisa dilakukan oleh klinik.
                </span>
              </p>
            )}
          </div>
        )}
      </Lembar>

      <Konfirmasi
        buka={!!batal}
        onTutup={() => setBatal(null)}
        onYa={lakukanBatal}
        sibuk={sibuk}
        judul="Batalkan Pesanan?"
        pesan={
          batal
            ? `Apakah Anda yakin ingin membatalkan pesanan ${batal.nomor_pesanan}? Pesanan yang dibatalkan tidak dapat dikembalikan.`
            : ''
        }
        labelYa="Ya, Batalkan"
      />
    </div>
  )
}
